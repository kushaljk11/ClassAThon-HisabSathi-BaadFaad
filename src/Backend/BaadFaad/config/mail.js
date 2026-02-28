/**
 * @file config/mail.js
 * @description SMTP-only mail transport with network diagnostics.
 */
import nodemailer from "nodemailer";
import dns from "node:dns";
import dnsPromises from "node:dns/promises";

const GMAIL_HOST = "smtp.gmail.com";

const getMailUser = () => process.env.EMAIL_USER || process.env.SMTP_MAIL;
const getMailPass = () => process.env.EMAIL_PASS || process.env.SMTP_PASS;
const getMailFrom = (fromName = "BaadFaad") =>
  process.env.MAIL_FROM || `"${fromName}" <${getMailUser()}>`;

const getTransporterConfig = () => {
  const MAIL_USER = getMailUser();
  const MAIL_PASS = getMailPass();
  const MAIL_CONNECTION_TIMEOUT = Number(process.env.MAIL_CONNECTION_TIMEOUT || 10000);
  const MAIL_GREETING_TIMEOUT = Number(process.env.MAIL_GREETING_TIMEOUT || 10000);
  const MAIL_SOCKET_TIMEOUT = Number(process.env.MAIL_SOCKET_TIMEOUT || 15000);
  const MAIL_DNS_TIMEOUT = Number(process.env.MAIL_DNS_TIMEOUT || 8000);
  const SMTP_HOST = process.env.SMTP_HOST || GMAIL_HOST;
  const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
  const SMTP_SECURE = process.env.SMTP_SECURE === "true";

  if (!MAIL_USER || !MAIL_PASS) {
    throw new Error("Missing SMTP credentials: set EMAIL_USER/EMAIL_PASS or SMTP_MAIL/SMTP_PASS");
  }

  return {
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    requireTLS: !SMTP_SECURE,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS,
    },
    connectionTimeout: MAIL_CONNECTION_TIMEOUT,
    greetingTimeout: MAIL_GREETING_TIMEOUT,
    socketTimeout: MAIL_SOCKET_TIMEOUT,
    dnsTimeout: MAIL_DNS_TIMEOUT,
    family: 4,
    lookup: (hostname, _options, callback) => {
      dns.lookup(hostname, { family: 4, all: false }, callback);
    },
    tls: {
      servername: SMTP_HOST,
    },
  };
};

let transporter = null;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport(getTransporterConfig());
  }
  return transporter;
};

const shouldRetryWithGmail465 = (error) => {
  const msg = String(error?.message || "").toLowerCase();
  const code = String(error?.code || "").toUpperCase();
  return (
    msg.includes("enetunreach") ||
    msg.includes("connection timeout") ||
    msg.includes("econnection") ||
    msg.includes("etimedout") ||
    code === "ETIMEDOUT" ||
    code === "ENETUNREACH"
  );
};

const buildIpv4PinnedConfig = ({ ipHost, port, secure, servername }) => {
  const MAIL_USER = getMailUser();
  const MAIL_PASS = getMailPass();
  const MAIL_CONNECTION_TIMEOUT = Number(process.env.MAIL_CONNECTION_TIMEOUT || 10000);
  const MAIL_GREETING_TIMEOUT = Number(process.env.MAIL_GREETING_TIMEOUT || 10000);
  const MAIL_SOCKET_TIMEOUT = Number(process.env.MAIL_SOCKET_TIMEOUT || 15000);
  const MAIL_DNS_TIMEOUT = Number(process.env.MAIL_DNS_TIMEOUT || 8000);

  return {
    host: ipHost,
    port,
    secure,
    requireTLS: !secure,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS,
    },
    connectionTimeout: MAIL_CONNECTION_TIMEOUT,
    greetingTimeout: MAIL_GREETING_TIMEOUT,
    socketTimeout: MAIL_SOCKET_TIMEOUT,
    dnsTimeout: MAIL_DNS_TIMEOUT,
    tls: {
      servername,
    },
  };
};

export const verifyMailConnection = async () => {
  await getTransporter().verify();
};

export const sendMail = async ({ to, subject, text, html, fromName = "BaadFaad" }) => {
  const payload = {
    from: getMailFrom(fromName),
    to,
    subject,
    text,
    html,
  };
  const originalPort = Number(process.env.SMTP_PORT || 587);
  const originalHost = process.env.SMTP_HOST || GMAIL_HOST;

  try {
    return await getTransporter().sendMail(payload);
  } catch (error) {
    console.error(
      `[mail] primary SMTP failed: host=${originalHost} port=${originalPort} code=${error?.code || "na"} address=${error?.address || "na"} message=${error?.message || error}`
    );

    if (shouldRetryWithGmail465(error)) {
      try {
        const ipv4List = await dnsPromises.resolve4(originalHost);
        const ipv4 = ipv4List?.[0];
        if (ipv4) {
          const ipv4Transporter = nodemailer.createTransport(
            buildIpv4PinnedConfig({
              ipHost: ipv4,
              port: originalPort,
              secure: originalPort === 465 || process.env.SMTP_SECURE === "true",
              servername: originalHost,
            })
          );
          const ipv4Result = await ipv4Transporter.sendMail(payload);
          console.warn(`[mail] IPv4-pinned retry succeeded via ${ipv4}:${originalPort}`);
          return ipv4Result;
        }
      } catch (ipv4Error) {
        console.error(
          `[mail] IPv4-pinned retry failed: code=${ipv4Error?.code || "na"} address=${ipv4Error?.address || "na"} message=${ipv4Error?.message || ipv4Error}`
        );
      }
    }

    if (shouldRetryWithGmail465(error) && originalHost === GMAIL_HOST && originalPort !== 465) {
      try {
        const ipv4List = await dnsPromises.resolve4(GMAIL_HOST);
        const ipv4 = ipv4List?.[0];
        if (ipv4) {
          const pinned465 = nodemailer.createTransport(
            buildIpv4PinnedConfig({
              ipHost: ipv4,
              port: 465,
              secure: true,
              servername: GMAIL_HOST,
            })
          );
          const pinnedResult = await pinned465.sendMail(payload);
          console.warn(`[mail] 465 IPv4-pinned retry succeeded via ${ipv4}:465`);
          return pinnedResult;
        }
      } catch (pinned465Error) {
        console.error(
          `[mail] 465 IPv4-pinned retry failed: code=${pinned465Error?.code || "na"} address=${pinned465Error?.address || "na"} message=${pinned465Error?.message || pinned465Error}`
        );
      }
    }

    try {
      const [v4, v6] = await Promise.allSettled([
        dnsPromises.resolve4(originalHost),
        dnsPromises.resolve6(originalHost),
      ]);
      console.error(
        `[mail] DNS diagnostic for ${originalHost}: A=${v4.status === "fulfilled" ? v4.value.join(",") : "ERR"} AAAA=${v6.status === "fulfilled" ? v6.value.join(",") : "ERR"}`
      );
    } catch {}

    throw error;
  }
};

export default { getTransporter, verifyMailConnection, sendMail };
