import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function requireEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} environment variable is not configured.`);
  }

  return value;
}

export function getEmailTransporter(): Transporter {
  if (transporter) {
    return transporter;
  }

  const host = requireEnvironmentVariable("SMTP_HOST");
  const user = requireEnvironmentVariable("SMTP_USER");
  const pass = requireEnvironmentVariable("SMTP_PASSWORD");

  const port = Number(process.env.SMTP_PORT ?? "587");

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT contains an invalid port number.");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  return transporter;
}