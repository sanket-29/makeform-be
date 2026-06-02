import Application from "../models/application";
import Permit from "../models/permit";
import FeeRecord from "../models/feeRecord";
import PaymentRecord from "../models/paymentRecord";

const normalizeLabel = (value: string) =>
  value
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const findValue = (app: any, keys: string[]) => {
  const normalizedKeys = keys.map(normalizeLabel);

  if (Array.isArray(app?.rawData)) {
    const item = app.rawData.find((row: any) => {
      const name = normalizeLabel(row?.name || "");
      return normalizedKeys.includes(name);
    });
    if (item?.value !== undefined && item?.value !== null) {
      return String(item.value);
    }
  }

  if (app?.data && typeof app.data === "object") {
    for (const key of Object.keys(app.data)) {
      if (normalizedKeys.includes(normalizeLabel(key))) {
        const value = app.data[key];
        if (value !== undefined && value !== null) {
          return String(value);
        }
      }
    }
  }

  return "";
};

const parseNumber = (value: any) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.-]+/g, "");
    return Number(cleaned) || 0;
  }
  return 0;
};

const formatDate = (value: any) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

// const formCodeMapping: Record<string, string> = {
//   "C-1": "Commercial Building Permit",
//   "E-1": "Electrical Permit",
//   "G-1": "Gas Permit",
//   "P-1": "Plumbing Permit",
//   "R-1": "Residential Building Permit",
//   "A-1": "Certificate Of Occupancy",
//   "c-1": "Commercial Building Permit",
//   "e-1": "Electrical Permit",
//   "g-1": "Gas Permit",
//   "p-1": "Plumbing Permit",
//   "r-1": "Residential Building Permit",
//   "a-1": "Certificate Of Occupancy",
// };

const isShortCode = (value: any): boolean => {
  if (value == null) return false;
  const str = String(value).trim();
  return /^[A-Za-z]{1,3}-?\d+$/i.test(str);
};

const getGroupName = (app: any) => {
  // Step 1: formType SABSE PEHLE — most reliable hai
  if (app?.formType) {
    const typeMap: Record<string, string> = {
      residential: "Residential Building Permit",
      commercial: "Commercial Building Permit",
      gas: "Gas Permit",
      electrical: "Electrical Permit",
      plumbing: "Plumbing Permit",
      general: "General Permit",
    };
    const mapped = typeMap[app.formType.toLowerCase()];
    if (mapped) return mapped;
  }

  // Step 2: rawData se dhundo — short codes skip karo
  const permitName = findValue(app, [
    "permit name",
    "trade",
    "permit type",
    "permit category",
    "service type",
  ]);
  if (permitName && !isShortCode(permitName)) return permitName;

  // Step 3: data object se dhundo — short codes skip karo
  const groupValue =
    app?.data?.permitName ||
    app?.data?.trade ||
    app?.data?.permitType ||
    app?.data?.category ||
    app?.data?.department ||
    app?.data?.applicationType ||
    app?.data?.type;
  if (groupValue && typeof groupValue === "string" && !isShortCode(groupValue)) {
    return groupValue;
  }

  // Step 4: formType ka raw value fallback (typeMap me nahi mila toh)
  if (app?.formType) return app.formType;

  return "Unknown";
};

const getPermitRows = async () => {
  const [applications, permits, payments, feeRecords] = await Promise.all([
    Application.find({}).lean(),
    Permit.find({}).lean(),
    PaymentRecord.find({}).lean(),
    FeeRecord.find({}).lean(),
  ]);

  const permitMap = new Map<string, any>();
  const paymentMap = new Map<string, any>();
  const feeMap = new Map<string, any>();

  permits.forEach((permit) => {
    if (permit.applicationId) permitMap.set(String(permit.applicationId), permit);
  });
  payments.forEach((payment) => {
    if (payment.applicationId) paymentMap.set(String(payment.applicationId), payment);
  });
  feeRecords.forEach((fee) => {
    if (fee.applicationId) feeMap.set(String(fee.applicationId), fee);
  });

  return applications.map((app: any) => {
    const applicationId = String(app._id);
    const permit = permitMap.get(applicationId) || {};
    const payment = paymentMap.get(applicationId) || {};
    const fee = feeMap.get(applicationId) || {};

    const permitNumber = permit.permitNo || String(permit.sequenceNumber || app.responseId || app.formId || app._id);
    const applicationDate = formatDate(app.createdAt || app.updatedAt);
    const issueDate = formatDate(permit.issueDate);
    const paymentDate = formatDate(payment.date);

    const applicant =
      findValue(app, ["applicant", "applicant name", "full name", "name", "owner name", "contact name"]) ||
      (app.data?.name ? String(app.data.name) : "");
    const owner =
      findValue(app, ["owner", "property owner", "owner name", "owner/agent", "applicant"]) ||
      (app.data?.owner ? String(app.data.owner) : "");
    const siteAddress =
      findValue(app, [
        "site address",
        "property address",
        "address",
        "location",
        "project address",
      ]) ||
      (app.data?.address ? String(app.data.address) : "");
    const mapLotBlock =
      findValue(app, ["map/lot/block", "map", "lot", "block", "parcel id", "parcel"]);
    const description =
      findValue(app, [
        "brief description",
        "description",
        "project description",
        "scope of work",
        "work description",
      ]) ||
      (app.data?.description ? String(app.data.description) : "");

    const cost = parseNumber(permit.fee || "");
    const fees = parseNumber(payment.amount || fee.amount || 0);
    const transactionMethod = payment.transactionMethod || "N/A";
    const refund = 0;
    const typeName = getGroupName(app);
    const status = String(app.status || "pending");

    return {
      applicationId,
      permitNumber,
      applicationDate,
      issueDate,
      paymentDate,
      applicant,
      owner,
      mapLotBlock,
      siteAddress,
      description,
      cost,
      fees,
      transactionMethod,
      feeMethod: transactionMethod.toLowerCase(),
      refund,
      typeName,
      status,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    };
  });
};

const summarizeByType = (rows: any[]) => {
  const map = new Map<string, any>();

  rows.forEach((row) => {
    const key = row.typeName || "Unknown";
    const entry = map.get(key) || {
      name: key,
      applications: 0,
      issued: 0,
      transactions: 0,
      cost: 0,
      fees: 0,
      cash: 0,
      check: 0,
      online: 0,
      waived: 0,
      refund: 0,
    };

    entry.applications += 1;
    if (row.issueDate) entry.issued += 1;
    entry.cost += row.cost;
    entry.fees += row.fees;
    if (row.transactionMethod.toLowerCase().includes("cash")) entry.cash += row.fees;
    else if (row.transactionMethod.toLowerCase().includes("check")) entry.check += row.fees;
    else if (row.transactionMethod.toLowerCase().includes("online") || row.transactionMethod.toLowerCase().includes("card")) entry.online += row.fees;    else if (row.transactionMethod.toLowerCase().includes("waived")) entry.waived += row.fees;
    else entry.transactions += row.paymentDate ? 1 : 0;
    entry.refund += row.refund;

    map.set(key, entry);
  });

  return Array.from(map.values());
};

const buildChartData = (rows: any[]) =>
  Object.entries(
    rows.reduce((acc: any, row: any) => {
      acc[row.typeName] = (acc[row.typeName] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

const buildPaymentSummary = (rows: any[]) => {
  const totals = { cash: 0, check: 0, online: 0, waived: 0, refund: 0 };

  rows.forEach((row) => {
    if (row.transactionMethod.toLowerCase().includes("cash")) totals.cash += row.fees;
    else if (row.transactionMethod.toLowerCase().includes("check")) totals.check += row.fees;
    else if (row.transactionMethod.toLowerCase().includes("online") || row.transactionMethod.toLowerCase().includes("card")) totals.online += row.fees;
    else if (row.transactionMethod.toLowerCase().includes("waived")) totals.waived += row.fees;
  });

  return [
    { name: "Cash", value: totals.cash },
    { name: "Check", value: totals.check },
    { name: "Online", value: totals.online },
    { name: "Waived", value: totals.waived },
  ];
};

const createTotals = (items: any[]) => ({
  applications: items.reduce((sum, item) => sum + (item.applications || 0), 0),
  issued: items.reduce((sum, item) => sum + (item.issued || 0), 0),
  transactions: items.reduce((sum, item) => sum + (item.transactions || 0), 0),
  cost: items.reduce((sum, item) => sum + (item.cost || 0), 0),
  fees: items.reduce((sum, item) => sum + (item.fees || 0), 0),
  cash: items.reduce((sum, item) => sum + (item.cash || 0), 0),
  check: items.reduce((sum, item) => sum + (item.check || 0), 0),
  online: items.reduce((sum, item) => sum + (item.online || 0), 0),
  waived: items.reduce((sum, item) => sum + (item.waived || 0), 0),
  refund: items.reduce((sum, item) => sum + (item.refund || 0), 0),
});

import express from "express";

const monthNames: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

const parseMonthYear = (month: string | undefined, year: string | undefined) => {
  const monthIndex = month ? monthNames[month.toLowerCase()] : undefined;
  const yearNum = year ? Number(year) : undefined;
  if (monthIndex === undefined || yearNum === undefined || Number.isNaN(yearNum)) {
    return null;
  }
  return {
    start: new Date(yearNum, monthIndex, 1, 0, 0, 0, 0),
    end: new Date(yearNum, monthIndex + 1, 0, 23, 59, 59, 999),
  };
};

const router = express.Router();

router.get("/common", async (req: any, res: any) => {
  try {
    const rows = await getPermitRows();
    const chartData = buildChartData(rows);
    const paymentData = buildPaymentSummary(rows);
    const totals = {
      grandTotal: rows.reduce((sum, item) => sum + (item.cost || 0), 0),
      cash: paymentData.find((item) => item.name === "Cash")?.value || 0,
      check: paymentData.find((item) => item.name === "Check")?.value || 0,
      online: paymentData.find((item) => item.name === "Online")?.value || 0,
      waived: paymentData.find((item) => item.name === "Waived")?.value || 0,
      refund: 0,
    };

    res.json({ rows, chartData, paymentData, totals });
  } catch (error: any) {
    console.error("Common report error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/summary", async (req: any, res: any) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const allRows = await getPermitRows();
    const filteredRows = allRows.filter((row) => {
      if (!row.applicationDate) return false;
      const date = new Date(row.applicationDate);
      return date.getFullYear() === year;
    });

    const summaryItems = summarizeByType(filteredRows);
    const chartData = buildChartData(filteredRows);
    const totals = createTotals(summaryItems);

    res.json({ year, summaryItems, chartData, totals });
  } catch (error: any) {
    console.error("Summary report error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/monthly", async (req: any, res: any) => {
  try {
    const { month, year } = req.query;
    const monthRange = parseMonthYear(month, year);
    if (!monthRange) {
      return res.status(400).json({ message: "Invalid month or year" });
    }

    const allRows = await getPermitRows();
    const filteredRows = allRows.filter((row) => {
      if (!row.applicationDate) return false;
      const date = new Date(row.applicationDate);
      return date >= monthRange.start && date <= monthRange.end;
    });

    const summaryItems = summarizeByType(filteredRows);
    const chartData = buildChartData(filteredRows);
    const totals = createTotals(summaryItems);

    res.json({ month, year: Number(year), summaryItems, chartData, totals });
  } catch (error: any) {
    console.error("Monthly report error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
