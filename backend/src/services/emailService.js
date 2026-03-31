import nodemailer from "nodemailer";

// --- REUSABLE TRANSPORTER (single persistent connection pool) ---
// Creating a transporter is expensive (TLS handshake). Do it ONCE at startup.
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      pool: true,           // Use connection pooling for speed
      maxConnections: 3,    // Allow up to 3 simultaneous connections
      maxMessages: 100,     // Send up to 100 messages per connection
    });
  }
  return transporter;
};

const PRIMARY_ORANGE = "#FF5E00";
const BG_BLACK = "#0A0A0A";
const BORDER_COLOR = "#1A1A1A";
const TEXT_GRAY = "#888888";

export const sendEmail = async (options) => {
  try {
    const transport = getTransporter();

    const mailOptions = {
      from: `"Antariksh Command" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject || "CRITICAL: AUTHENTICATION_KEY_REQUESTED",
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
                    ${options.otp}
                  </div>
                </div>
                <p style="font-size:11px;color:${PRIMARY_ORANGE};font-weight:bold;text-transform:uppercase;letter-spacing:2px;">
                  Warning: Key expires in 600 seconds.
                </p>
                <div style="margin-top:40px;padding-top:20px;border-top:1px solid ${BORDER_COLOR};text-align:left;">
                  <p style="font-size:9px;color:#444444;text-transform:uppercase;line-height:1.8;margin:0;">
                    // All actions are logged by Planetary Defense AI. <br/>
                    // Secure your terminal immediately.
                  </p>
                </div>
              </td>
            </tr>
          </table>
          <div style="margin-top:20px;font-size:10px;color:#333333;text-transform:uppercase;letter-spacing:2px;">
            Antariksh_Intelligence_Systems // 2026_Archive
          </div>
        </div>
      `,
    };

    return await transport.sendMail(mailOptions);
  } catch (error) {
    console.error("Email Dispatch Error (OTP):", error.message);
    throw error;
  }
};

export const sendVaultNotification = async (email, asteroidName) => {
  try {
    const transport = getTransporter();
    const mailOptions = {
      from: `"Antariksh Systems" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `[VAULT] Asteroid Saved Successfully: ${asteroidName}`,
      html: `
        <div style="background-color:${BG_BLACK};padding:40px 20px;font-family:'Courier New',Courier,monospace;color:#FFFFFF;text-align:center;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border:1px solid #333;background:#000000;">
            <tr>
              <td style="padding:30px;text-align:left;">
                <div style="color:#10b981;font-size:10px;font-weight:bold;letter-spacing:2px;margin-bottom:15px;">
                  ● VAULT_SAVE_COMPLETE
                </div>
                <h2 style="font-size:20px;text-transform:uppercase;letter-spacing:2px;margin:0 0 20px 0;color:#FFF;">
                  Asteroid <span style="color:${PRIMARY_ORANGE};">Saved</span>
                </h2>
                <div style="background:rgba(255,255,255,0.03);border-left:3px solid ${PRIMARY_ORANGE};padding:20px;margin-bottom:25px;">
                  <p style="font-size:14px;margin:0;color:#EEE;line-height:1.8;">
                    You successfully saved asteroid <strong style="color:${PRIMARY_ORANGE};">${asteroidName}</strong> to your private Antariksh vault.
                  </p>
                  <p style="font-size:12px;margin:14px 0 0 0;color:#AAA;line-height:1.7;">
                    You can review it anytime from the Data Hub secure archive for your account.
                  </p>
                </div>
                <p style="font-size:10px;color:#555;text-transform:uppercase;font-weight:bold;">
                  Status: SAVED_SUCCESSFULLY <br/>
                  Module: PRIVATE_WATCHLIST <br/>
                  Timestamp: ${new Date().toLocaleString()}
                </p>
              </td>
            </tr>
          </table>
        </div>
      `,
    };

    return await transport.sendMail(mailOptions);
  } catch (error) {
    console.error("Email Dispatch Error (Vault):", error.message);
    return null;
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
    if (!recipients?.length) return null;

    const transport = getTransporter();
    const mailOptions = {
      from: `"Antariksh Research Grid" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      bcc: recipients.join(","),
      subject: `[RESEARCH] New paper published for ${asteroidName}`,
      html: `
        <div style="background-color:${BG_BLACK};padding:40px 20px;font-family:'Courier New',Courier,monospace;color:#FFFFFF;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border:1px solid ${PRIMARY_ORANGE};background:#000000;">
            <tr>
              <td style="padding:30px;">
                <h2 style="margin:0 0 20px 0;color:${PRIMARY_ORANGE};font-size:18px;text-transform:uppercase;letter-spacing:3px;">
                  // Research_Facility_Notice
                </h2>
                <p style="font-size:13px;color:${TEXT_GRAY};text-transform:uppercase;margin-bottom:25px;">
                  A new asteroid-linked paper has been uplinked to the global archive.
                </p>
                <table width="100%" style="border-collapse:collapse;margin-bottom:30px;">
                  <tr>
                    <td style="padding:12px;border:1px solid #222;font-size:11px;color:${PRIMARY_ORANGE};text-transform:uppercase;width:100px;">Paper</td>
                    <td style="padding:12px;border:1px solid #222;font-size:12px;color:#FFF;">${paperTitle}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px;border:1px solid #222;font-size:11px;color:${PRIMARY_ORANGE};text-transform:uppercase;">Object</td>
                    <td style="padding:12px;border:1px solid #222;font-size:12px;color:#FFF;">${asteroidName}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px;border:1px solid #222;font-size:11px;color:${PRIMARY_ORANGE};text-transform:uppercase;">Author</td>
                    <td style="padding:12px;border:1px solid #222;font-size:12px;color:#FFF;">${authorName}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px;border:1px solid #222;font-size:11px;color:${PRIMARY_ORANGE};text-transform:uppercase;">Contact</td>
                    <td style="padding:12px;border:1px solid #222;font-size:12px;color:#FFF;">${contactEmail}</td>
                  </tr>
                </table>
                <div style="text-align:center;">
                  <p style="color:#444;font-size:10px;text-transform:uppercase;">
                    This publication notice was forwarded to all verified users in the Antariksh network.
                  </p>
                </div>
              </td>
            </tr>
          </table>
        </div>
      `,
    };

    return await transport.sendMail(mailOptions);
  } catch (error) {
    console.error("Email Dispatch Error (Research):", error.message);
    return null;
  }
};
