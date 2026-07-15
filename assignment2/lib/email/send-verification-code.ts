import { getEmailTransporter } from "@/lib/email/transporter";

type SendVerificationCodeEmailInput = {
  fullName: string;
  email: string;
  code: string;
  expiresInMinutes: number;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendVerificationCodeEmail({
  fullName,
  email,
  code,
  expiresInMinutes,
}: SendVerificationCodeEmailInput): Promise<void> {
  const from = process.env.EMAIL_FROM?.trim();

  if (!from) {
    throw new Error("EMAIL_FROM environment variable is not configured.");
  }

  const transporter = getEmailTransporter();
  const safeFullName = escapeHtml(fullName);
  const safeCode = escapeHtml(code);

  await transporter.sendMail({
    from,
    to: email,
    subject: "Verify your SavePlate account",
    text: [
      `Hello ${fullName},`,
      "",
      `Your SavePlate verification code is: ${code}`,
      "",
      `This code expires in ${expiresInMinutes} minutes.`,
      "",
      "If you did not create this account, you can ignore this email.",
    ].join("\n"),

    html: `
      <div style="background:#F7F8F3;padding:32px;font-family:Arial,sans-serif;color:#10271F">
        <div style="max-width:520px;margin:auto;background:#FFFFFF;border-radius:18px;padding:32px">
          <h1 style="margin:0;color:#065F46;font-size:26px">
            Verify your SavePlate account
          </h1>

          <p style="margin-top:24px">
            Hello ${safeFullName},
          </p>

          <p>
            Enter this six-digit code to activate your SavePlate account:
          </p>

          <div style="
            margin:24px 0;
            padding:18px;
            background:#052E24;
            color:#BEF264;
            border-radius:14px;
            font-size:32px;
            font-weight:700;
            letter-spacing:10px;
            text-align:center;
          ">
            ${safeCode}
          </div>

          <p style="color:#52665D">
            This code expires in ${expiresInMinutes} minutes.
          </p>

          <p style="color:#52665D;font-size:13px">
            If you did not create this account, you can ignore this email.
          </p>
        </div>
      </div>
    `,
  });
}