import nodemailer from "nodemailer";

export const sendEmail = async (to: string, cc: string | undefined, subject: string, html: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      cc: cc || undefined,
      subject,
      html,
    });

    console.log("✅ Email sent successfully");
    return { success: true };
  } catch (error) {
    console.log("❌ Email error:", error);
    return { success: false, error };
  }
};

export const sendOtpEmail = async (to: string, otp: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: "Your OTP Code",
      html: `
        <h2>Your OTP Code</h2>
        <p>Your OTP is: <b>${otp}</b></p>
        <p>This OTP will expire in 5 minutes.</p>
      `,
    });

    console.log("✅ OTP email sent");
  } catch (error) {
    console.log("❌ Email error:", error);
  }
};