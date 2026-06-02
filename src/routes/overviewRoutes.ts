import express from "express";
import { verifyToken } from "../middleware/auth.middleware";
import Application from "../models/application";
import Signoff from "../models/signoff.model";
import Inspection from "../models/inspection";
import FeeRecord from "../models/feeRecord";
import Permit from "../models/permit";

const router = express.Router();

router.get("/overview", verifyToken, async (req, res) => {
  try {
    // Get today's date range
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));

    // Get date 7 days ago for chart data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 1. Total Applications count
    const totalApplications = await Application.countDocuments();

    // 2. Today's applications
    const todayApplications = await Application.countDocuments({
      createdAt: {
        $gte: todayStart,
        $lte: todayEnd
      }
    });

    // 3. Issued Today - count permits issued today
    const issuedToday = await Permit.countDocuments({
      issueDate: {
        $gte: todayStart.toISOString().split('T')[0],
        $lte: todayEnd.toISOString().split('T')[0]
      }
    });

    // 4. Pending applications
    const pending = await Application.countDocuments({ status: "pending" });

    // 4. Revenue - sum of all paid fees
    const feeRecords = await FeeRecord.find({ paid: true });
    const revenue = feeRecords.reduce((sum, record) => sum + (record.amount || 0), 0);
    const formattedRevenue = `$${revenue.toLocaleString()}`;

    // // 5. Chart Data - Applications Trend (last 7 days)
    // const applicationsLast7Days = await Application.find({
    //   createdAt: { $gte: sevenDaysAgo }
    // });

    // // Group by day
    // const dayMap: { [key: string]: number } = {
    //   "Sun": 0, "Mon": 0, "Tue": 0, "Wed": 0, "Thu": 0, "Fri": 0, "Sat": 0
    // };
    
    // applicationsLast7Days.forEach(app => {
    //   const date = new Date(app.createdAt);
    //   const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
    //   dayMap[dayName]++;
    // });

    // const chartData = Object.entries(dayMap).map(([name, value]) => ({
    //   name,
    //   value
    // }));

    // 6. Signoff Summary
    const signoffsData = await Signoff.find({});
    let approved = 0;
    let signoffPending = 0;
    let denied = 0;

    signoffsData.forEach(doc => {
      doc.signoffs.forEach(item => {
        const status = item.status?.toLowerCase() || item.currentStatus?.toLowerCase() || "pending";
        if (status === "approved") approved++;
        else if (status === "pending") signoffPending++;
        else if (status === "denied") denied++;
      });
    });

    // 7. Applications / Permits by Department or Type
    const applicationsList = await Application.find({});
    const permits = await Permit.find({});
    const permitMap = new Map<string, any>();
    permits.forEach((permit) => {
      if (permit.applicationId) {
        permitMap.set(permit.applicationId.toString(), permit);
      }
    });

    const formTypeMap: { [key: string]: string } = {
      "general": "General Permit",
      "residential": "Residential Permit",
      "commercial": "Commercial Permit"
    };
    type BucketKey = "0 DAYS" | "1-5 DAYS" | "6-10 DAYS" | "11+ DAYS";
    type BucketCounts = { [K in BucketKey]: number };
    type ApplicationSummary = {
      applied: number;
      issued: number;
      notIssued: number;
    } & BucketCounts;

    const getBucket = (daysAgo: number): BucketKey => {
      if (daysAgo === 0) return "0 DAYS";
      if (daysAgo >= 1 && daysAgo <= 5) return "1-5 DAYS";
      if (daysAgo >= 6 && daysAgo <= 10) return "6-10 DAYS";
      return "11+ DAYS";
    };

    const normalizeRawLabel = (label: string): string =>
      label.toString().toLowerCase().replace(/[_\-\s]+/g, " ").trim();

    const findRawValue = (app: any, keys: string[]): any => {
      if (!Array.isArray(app?.rawData)) return undefined;
      const normalizedKeys = keys.map(k => normalizeRawLabel(k));
      const item = app.rawData.find((row: any) => {
        const name = normalizeRawLabel(row?.name || "");
        return normalizedKeys.includes(name);
      });
      return item?.value;
    };

    const isShortCode = (value: any): boolean => {
      if (value == null) return false;
      const str = String(value).trim();
      return /^[A-Z]{1,3}-?\d+$/.test(str) || /^[A-Z]\d+$/.test(str);
    };

    const getGroupName = (app: any): string => {
      const directValue = app?.data?.department || app?.data?.permitType || app?.data?.applicationType || app?.data?.type;
      if (directValue && !isShortCode(directValue)) {
        return String(directValue);
      }

      const rawValue = findRawValue(app, [
        "department",
        "permit type",
        "permit category",
        "application type",
        "type",
        "trade",
        "category",
        "service type",
        "permit name",
        "project type",
        "form type"
      ]);
      if (rawValue && !isShortCode(rawValue)) {
        return String(rawValue);
      }

      // Fallback to labeled formType names
      return formTypeMap[app.formType] || app.formType || "Unknown";
    };

    const applicationsMap: Record<string, ApplicationSummary> = {};

    const now = new Date().getTime();
    applicationsList.forEach((app) => {
      const name = getGroupName(app);
      if (!applicationsMap[name]) {
        applicationsMap[name] = {
          applied: 0,
          issued: 0,
          notIssued: 0,
          "0 DAYS": 0,
          "1-5 DAYS": 0,
          "6-10 DAYS": 0,
          "11+ DAYS": 0,
        };
      }

      const permit = permitMap.get(app._id.toString());
      const isIssued = Boolean(permit?.issueDate);
      const createdAt = new Date(app.createdAt || app.updatedAt || now);
      const daysAgo = Math.floor((now - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      const bucket = getBucket(daysAgo);

      applicationsMap[name].applied += 1;
      if (isIssued) {
        applicationsMap[name].issued += 1;
      } else {
        applicationsMap[name].notIssued += 1;
      }
      applicationsMap[name][bucket] += 1;
    });

    const applications = Object.entries(applicationsMap).map(([name, data]) => ({
      name,
      applied: data.applied,
      issued: data.issued,
      notIssued: data.notIssued,
      "0 DAYS": data["0 DAYS"],
      "1-5 DAYS": data["1-5 DAYS"],
      "6-10 DAYS": data["6-10 DAYS"],
      "11+ DAYS": data["11+ DAYS"],
    }));

    const departmentTotals = applications.map(item => ({
      name: item.name,
      total: item.applied,
    }));

    // 8. Signoffs by Department
    type SignoffBucketKey = "0 DAYS" | "1-5 DAYS" | "6-10 DAYS" | "11+ DAYS";
    const departmentSignoffNow = Date.now();
    const departmentStatus: { [key: string]: { pending: number, approved: number, denied: number, assigned: number, "0 DAYS": number, "1-5 DAYS": number, "6-10 DAYS": number, "11+ DAYS": number } } = {};
    const departmentBucket = (daysAgo: number): SignoffBucketKey => {
      if (daysAgo === 0) return "0 DAYS";
      if (daysAgo >= 1 && daysAgo <= 5) return "1-5 DAYS";
      if (daysAgo >= 6 && daysAgo <= 10) return "6-10 DAYS";
      return "11+ DAYS";
    };

    signoffsData.forEach(doc => {
      doc.signoffs.forEach(item => {
        const dept = item.department;
        const status = item.status?.toLowerCase() || item.currentStatus?.toLowerCase() || "pending";
        
        if (!departmentStatus[dept]) {
          departmentStatus[dept] = {
            pending: 0,
            approved: 0,
            denied: 0,
            assigned: 0,
            "0 DAYS": 0,
            "1-5 DAYS": 0,
            "6-10 DAYS": 0,
            "11+ DAYS": 0,
          };
        }

        departmentStatus[dept].assigned += 1;
        if (status === "approved") departmentStatus[dept].approved++;
        else if (status === "pending") departmentStatus[dept].pending++;
        else if (status === "denied") departmentStatus[dept].denied++;

        const itemDate = item.date ? new Date(item.date).getTime() : departmentSignoffNow;
        const daysAgo = Math.max(0, Math.floor((departmentSignoffNow - itemDate) / (1000 * 60 * 60 * 24)));
        const bucket = departmentBucket(daysAgo);
        departmentStatus[dept][bucket] += 1;
      });
    });

    const signOffs = Object.entries(departmentStatus).map(([name, stats]) => {
      let value: string;
      if (stats.pending > 0) {
        value = `${stats.pending} Pending`;
      } else if (stats.approved > 0 && stats.denied === 0) {
        value = "Approved";
      } else if (stats.denied > 0) {
        value = "Denied";
      } else {
        value = "Pending";
      }
      return {
        name,
        assigned: stats.assigned,
        pending: stats.pending,
        granted: stats.approved,
        denied: stats.denied,
        "0 DAYS": stats["0 DAYS"],
        "1-5 DAYS": stats["1-5 DAYS"],
        "6-10 DAYS": stats["6-10 DAYS"],
        "11+ DAYS": stats["11+ DAYS"],
      };
    });

    // 9. Inspector Activity
    const inspections = await Inspection.find({});
    const totalInspections = inspections.length;
    const granted = inspections.filter(i => i.result?.toLowerCase() === "granted").length;
    const deniedInspections = inspections.filter(i => i.result?.toLowerCase() === "denied").length;

    // 10. Change Requests (using permits with specific criteria)
    const changeRequests = await Permit.find({
      remarks: { $regex: /change/i }
    }).limit(10);

    const changeRequestsData = changeRequests.map(p => ({
      id: p.sequenceNumber || p._id,
      type: "Change Order",
      status: p.remarks?.toLowerCase().includes("inactive") ? "Inactive" : "Active"
    }));

    // If no change requests found, return sample data
    if (changeRequestsData.length === 0) {
      changeRequestsData.push({ id: 5179, type: "Change Order", status: "Inactive" });
    }

    res.json({
      totalApplications,
      todayApplications,
      issuedToday,
      pending,
      revenue: formattedRevenue,
      chartSummary: {
        total: totalApplications,
        today: todayApplications,
        departments: departmentTotals
      },
      // chartData,
      signoffs: {
        approved,
        pending: signoffPending,
        denied
      },
      applications,
      signOffs,
      inspectorActivity: {
        inspections: totalInspections,
        granted,
        denied: deniedInspections
      },
      changeRequests: changeRequestsData
    });
  } catch (error) {
    console.error("Overview error:", error);
    res.status(500).json({ message: "Server error", error: String(error) });
  }
});

export default router;