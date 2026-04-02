import nodemailer from "nodemailer";

let transporter;

const PRIMARY_ORANGE = "#FF5E00";
const BG_BLACK = "#0A0A0A";
const BORDER_COLOR = "#1A1A1A";
const TEXT_GRAY = "#888888";

const getTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER and EMAIL_PASS must be configured.");
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return transporter;
};

const sendMail = async ({ to, subject, text, html, fromName = "Antariksh Systems", bcc }) => {
  try {
    const info = await getTransporter().sendMail({
      from: `"${fromName}" <${process.env.EMAIL_USER}>`,
      to,
      bcc,
      subject,
      text,
      html,
    });

    console.log("Email sent successfully:", {
      to,
      bccCount: Array.isArray(bcc) ? bcc.length : bcc ? String(bcc).split(",").length : 0,
      subject,
      messageId: info.messageId,
      accepted: info.accepted,
    });

    return { success: true, info };
  } catch (error) {
    console.error("Email send failed:", {
      to,
      subject,
      message: error.message,
    });
    throw error;
  }
};

export const sendEmail = async ({ email, subject, otp }) => {
  return sendMail({
    to: email,
    subject: subject || "Antariksh Security Protocol: Verification OTP",
    text: `Your Antariksh verification code is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="background-color:${BG_BLACK};padding:40px 20px;font-family:'Courier New',Courier,monospace;color:#FFFFFF;text-align:center;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border:1px solid ${PRIMARY_ORANGE};background:#000000;box-shadow:0 0 20px rgba(255,94,0,0.2);">
          <tr>
            <td style="padding:30px;">
              <div style="text-align:left;color:${PRIMARY_ORANGE};font-size:10px;font-weight:bold;letter-spacing:3px;margin-bottom:20px;text-transform:uppercase;">
                // System_Identity: Antariksh_V5.2 <br/>
                // Protocol: Secure_Uplink_Auth
              </div>
              <h1 style="font-size:28px;font-weight:900;letter-spacing:-1px;text-transform:uppercase;margin:0;font-style:italic;">
                Registry <span style="color:rgba(255,255,255,0.2);">Uplink</span>
              </h1>
              <div style="height:1px;background:${BORDER_COLOR};width:100%;margin:20px 0;"></div>
              <p style="font-size:13px;color:${TEXT_GRAY};line-height:1.6;text-transform:uppercase;letter-spacing:1px;">
                Access requested. Use the following encrypted key to bypass the firewall:
              </p>
              <div style="margin:40px 0;padding:30px;border:1px dashed ${PRIMARY_ORANGE};background:rgba(255,94,0,0.05);">
                <div style="font-size:10px;color:${PRIMARY_ORANGE};margin-bottom:10px;letter-spacing:2px;">[ AUTH_KEY ]</div>
                <div style="font-size:48px;font-weight:bold;color:#FFFFFF;letter-spacing:15px;text-shadow:0 0 10px ${PRIMARY_ORANGE};">
                  ${otp}
                </div>
              </div>
              <p style="font-size:11px;color:${PRIMARY_ORANGE};font-weight:bold;text-transform:uppercase;letter-spacing:2px;">
                Warning: Key expires in 600 seconds.
              </p>
            </td>
          </tr>
        </table>
      </div>
    `,
    fromName: "Antariksh Command",
  });
};

export const sendSecurityOtpEmail = async ({
  email,
  otp,
  subject = "Antariksh Security Protocol",
  headline = "Security Verification",
  message = "Use the verification code below to continue.",
}) => {
  return sendMail({
    to: email,
    subject,
    text: `${message} Your code is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="background-color:${BG_BLACK};padding:40px 20px;font-family:'Courier New',Courier,monospace;color:#FFFFFF;text-align:center;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border:1px solid ${PRIMARY_ORANGE};background:#000000;box-shadow:0 0 20px rgba(255,94,0,0.2);">
          <tr>
            <td style="padding:30px;text-align:left;">
              <div style="color:${PRIMARY_ORANGE};font-size:10px;font-weight:bold;letter-spacing:3px;margin-bottom:20px;text-transform:uppercase;">
                Secure_Auth_Channel
              </div>
              <h1 style="font-size:26px;font-weight:900;letter-spacing:-1px;text-transform:uppercase;margin:0 0 18px 0;font-style:italic;">
                ${headline}
              </h1>
              <p style="font-size:13px;color:${TEXT_GRAY};line-height:1.6;text-transform:uppercase;letter-spacing:1px;margin:0 0 28px 0;">
                ${message}
              </p>
              <div style="margin:0 0 28px 0;padding:26px;border:1px dashed ${PRIMARY_ORANGE};background:rgba(255,94,0,0.05);text-align:center;">
                <div style="font-size:10px;color:${PRIMARY_ORANGE};margin-bottom:10px;letter-spacing:2px;">[ SECURITY_CODE ]</div>
                <div style="font-size:42px;font-weight:bold;color:#FFFFFF;letter-spacing:12px;text-shadow:0 0 10px ${PRIMARY_ORANGE};">
                  ${otp}
                </div>
              </div>
              <p style="font-size:11px;color:${PRIMARY_ORANGE};font-weight:bold;text-transform:uppercase;letter-spacing:2px;margin:0;">
                Code expires in 10 minutes.
              </p>
            </td>
          </tr>
        </table>
      </div>
    `,
    fromName: "Antariksh Command",
  });
};

export const sendVaultNotification = async (email, asteroidName) => {
  try {
    return await sendMail({
      to: email,
      subject: `[VAULT] Asteroid Saved Successfully: ${asteroidName}`,
      text: `You successfully saved asteroid ${asteroidName} to your Antariksh vault.`,
      html: `
        <div style="background-color:${BG_BLACK};padding:40px 20px;font-family:'Courier New',Courier,monospace;color:#FFFFFF;text-align:center;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border:1px solid #333;background:#000000;">
            <tr>
              <td style="padding:30px;text-align:left;">
                <div style="color:#10b981;font-size:10px;font-weight:bold;letter-spacing:2px;margin-bottom:15px;">
                  VAULT_SAVE_COMPLETE
                </div>
                <h2 style="font-size:20px;text-transform:uppercase;letter-spacing:2px;margin:0 0 20px 0;color:#FFF;">
                  Asteroid <span style="color:${PRIMARY_ORANGE};">Saved</span>
                </h2>
                <p style="font-size:14px;margin:0;color:#EEE;line-height:1.8;">
                  You successfully saved asteroid <strong style="color:${PRIMARY_ORANGE};">${asteroidName}</strong> to your private Antariksh vault.
                </p>
              </td>
            </tr>
          </table>
        </div>
      `,
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const sendResearchPublicationNotice = async ({
  recipients,
  paperTitle,
  asteroidName,
  authorName,
  contactEmail,
}) => {
  try {
    if (!recipients?.length) {
      return { success: false, message: "No recipients available." };
    }

    return await sendMail({
      to: process.env.EMAIL_USER,
      bcc: recipients.join(","),
      subject: `[RESEARCH] New paper published for ${asteroidName}`,
      text: `New paper "${paperTitle}" for ${asteroidName} by ${authorName}. Contact: ${contactEmail}`,
      html: `
        <div style="background-color:${BG_BLACK};padding:40px 20px;font-family:'Courier New',Courier,monospace;color:#FFFFFF;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border:1px solid ${PRIMARY_ORANGE};background:#000000;">
            <tr>
              <td style="padding:30px;">
                <h2 style="margin:0 0 20px 0;color:${PRIMARY_ORANGE};font-size:18px;text-transform:uppercase;letter-spacing:3px;">
                  Research_Facility_Notice
                </h2>
                <p style="font-size:13px;color:${TEXT_GRAY};text-transform:uppercase;margin-bottom:25px;">
                  A new asteroid-linked paper has been uplinked to the global archive.
                </p>
                <p style="font-size:12px;color:#FFF;">Paper: ${paperTitle}</p>
                <p style="font-size:12px;color:#FFF;">Object: ${asteroidName}</p>
                <p style="font-size:12px;color:#FFF;">Author: ${authorName}</p>
                <p style="font-size:12px;color:#FFF;">Contact: ${contactEmail}</p>
              </td>
            </tr>
          </table>
        </div>
      `,
      fromName: "Antariksh Research Grid",
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
};
