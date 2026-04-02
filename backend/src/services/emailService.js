import nodemailer from "nodemailer";

const PRIMARY_ORANGE = "#FF5E00";
const BG_BLACK = "#0A0A0A";
const BORDER_COLOR = "#1A1A1A";
const TEXT_GRAY = "#888888";
const MAIL_RETRY_DELAYS_MS = [250, 1000, 2500];

let transporterPromise;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getMailConfig = () => {
  const host = process.env.MAIL_HOST || process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.MAIL_PORT || process.env.SMTP_PORT || 587);
  const secure =
    String(process.env.MAIL_SECURE || process.env.SMTP_SECURE || port === 465)
      .toLowerCase()
      .trim() === "true";
  const user = process.env.MAIL_USER || process.env.EMAIL_USER;
  const pass = process.env.MAIL_PASS || process.env.EMAIL_PASS;
  const fromEmail = process.env.MAIL_FROM || user;
  const fromName = process.env.MAIL_FROM_NAME || "Antariksh Command";

  return { host, port, secure, user, pass, fromEmail, fromName };
};

export const verifyMailConnection = async () => {
  try {
    const transporter = await getTransporter();
    const config = getMailConfig();
    console.log(
      JSON.stringify({
        scope: "mail_system_ready",
        host: config.host,
        user: config.user,
        from: config.fromEmail,
      }),
    );
    return true;
  } catch (error) {
    console.error(
      JSON.stringify({
        scope: "mail_system_critical_failure",
        message: error.message,
      }),
    );
    return false;
  }
};

const createTransporter = async () => {
  const config = getMailConfig();

  if (!config.user || !config.pass) {
    throw new Error("MAIL_USER and MAIL_PASS must be configured.");
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });

  await transporter.verify();
  return transporter;
};

const getTransporter = async () => {
  if (!transporterPromise) {
    transporterPromise = createTransporter().catch((error) => {
      transporterPromise = null;
      throw error;
    });
  }

  return transporterPromise;
};

const sendWithRetry = async (mailOptions) => {
  let lastError;

  for (let attempt = 0; attempt <= MAIL_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      const transporter = await getTransporter();
      return await transporter.sendMail(mailOptions);
    } catch (error) {
      lastError = error;
      console.error(
        JSON.stringify({
          scope: "mail_send_failed",
          attempt: attempt + 1,
          to: mailOptions.to,
          subject: mailOptions.subject,
          message: error.message,
        }),
      );

      if (attempt === MAIL_RETRY_DELAYS_MS.length) {
        break;
      }

      await sleep(MAIL_RETRY_DELAYS_MS[attempt]);
    }
  }

  throw lastError;
};

const sendMail = async ({
  to,
  subject,
  text,
  html,
  fromName = getMailConfig().fromName,
  bcc,
  replyTo,
}) => {
  const config = getMailConfig();
  const info = await sendWithRetry({
    from: `"${fromName}" <${config.fromEmail}>`,
    to,
    bcc,
    replyTo,
    subject,
    text,
    html,
  });

  console.log(
    JSON.stringify({
      scope: "mail_sent",
      to,
      subject,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    }),
  );

  return { success: true, info };
};

const createOtpTemplate = ({ otp, title, message, label = "AUTH_KEY" }) => ({
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
              ${title}
            </h1>
            <p style="font-size:13px;color:${TEXT_GRAY};line-height:1.6;text-transform:uppercase;letter-spacing:1px;margin:0 0 28px 0;">
              ${message}
            </p>
            <div style="margin:0 0 28px 0;padding:26px;border:1px dashed ${PRIMARY_ORANGE};background:rgba(255,94,0,0.05);text-align:center;">
              <div style="font-size:10px;color:${PRIMARY_ORANGE};margin-bottom:10px;letter-spacing:2px;">[ ${label} ]</div>
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
});

export const sendEmail = async ({ email, subject, otp }) => {
  const template = createOtpTemplate({
    otp,
    title: "Registry Uplink",
    message: "Use the verification code below to activate your Antariksh account.",
  });

  return sendMail({
    to: email,
    subject: subject || "Antariksh Security Protocol: Verification OTP",
    ...template,
  });
};

export const sendSecurityOtpEmail = async ({
  email,
  otp,
  subject = "Antariksh Security Protocol",
  headline = "Security Verification",
  message = "Use the verification code below to continue.",
}) => {
  const template = createOtpTemplate({
    otp,
    title: headline,
    message,
    label: "SECURITY_CODE",
  });

  return sendMail({
    to: email,
    subject,
    ...template,
  });
};

export const sendVaultNotification = async (email, asteroidName) => {
  return sendMail({
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
};

export const sendResearchPublicationNotice = async ({
  recipients,
  paperTitle,
  asteroidName,
  authorName,
  contactEmail,
}) => {
  if (!recipients?.length) {
    return { success: false, message: "No recipients available." };
  }

  return sendMail({
    to: getMailConfig().fromEmail,
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
};

export const sendContactEmail = async ({
  name,
  email,
  subject,
  message,
}) => {
  const config = getMailConfig();

  return sendMail({
    to: config.fromEmail,
    replyTo: email,
    subject: `[CONTACT] ${subject || "New message from Antariksh"}`,
    text: `From: ${name} <${email}>\n\n${message}`,
    html: `
      <div style="background:${BG_BLACK};padding:40px 20px;font-family:'Courier New',Courier,monospace;color:#FFFFFF;">
        <table align="center" width="100%" style="max-width:640px;border:1px solid ${PRIMARY_ORANGE};background:#000000;">
          <tr>
            <td style="padding:30px;">
              <h2 style="margin:0 0 18px;color:${PRIMARY_ORANGE};font-size:18px;text-transform:uppercase;letter-spacing:3px;">
                Contact_Message
              </h2>
              <p style="font-size:12px;color:#FFF;margin:0 0 10px;">From: ${name}</p>
              <p style="font-size:12px;color:#FFF;margin:0 0 18px;">Email: ${email}</p>
              <div style="border-top:1px solid ${BORDER_COLOR};padding-top:18px;font-size:13px;color:${TEXT_GRAY};line-height:1.8;white-space:pre-wrap;">
                ${message}
              </div>
            </td>
          </tr>
        </table>
      </div>
    `,
    fromName: "Antariksh Contact Relay",
  });
};
