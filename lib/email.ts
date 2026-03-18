import { Resend } from "resend";
import type { ProductRecord } from "@/lib/types";
import { formatCurrency, normalizeCurrencyCode } from "@/lib/currency";

const resend = new Resend(process.env.RESEND_API_KEY);

function fmtPrice(value: number, currency: string): string {
  return formatCurrency(value, normalizeCurrencyCode(currency), "en-US", {
    maximumFractionDigits: 2,
  });
}

/** Truncate a product name to ~50 chars for the subject line */
function shortName(name: string, max = 50): string {
  return name.length <= max ? name : name.slice(0, max).trimEnd() + "…";
}

export async function sendPriceDropAlert(
  userEmail: string,
  product: ProductRecord,
  oldPrice: number,
  newPrice: number,
  options?: {
    isTargetHit?: boolean;
    alertPrice?: number | null;
  },
) {
  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL;

    if (!fromEmail) {
      return { error: "RESEND_FROM_EMAIL is not configured" };
    }

    const priceDrop = oldPrice - newPrice;
    const percentageDrop = ((priceDrop / oldPrice) * 100).toFixed(0);
    const isTargetHit = options?.isTargetHit === true;
    const alertPrice = options?.alertPrice ?? null;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://betterdeals.vercel.app";

    const subject = isTargetHit
      ? `🎯 Target hit — ${shortName(product.name)} is now ${fmtPrice(newPrice, product.currency)}`
      : `📉 ${percentageDrop}% off — ${shortName(product.name)}`;

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: userEmail,
      subject,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#fff;border-radius:18px;box-shadow:0 2px 8px rgba(0,0,0,0.06);padding:0 0 24px 0;">
          <!-- Logo -->
          <tr>
            <td style="padding-top:32px;padding-bottom:8px;text-align:center;">
              <img src="https://betterdeals.vercel.app/logo-email.png" alt="Better Deals" style="height:54px;width:auto;display:block;margin:0 auto 8px auto;" />
              <div style="font-size:18px;font-weight:700;color:#0f172a;letter-spacing:-0.3px;">Better Deals</div>
              <div style="font-size:14px;color:#64748b;margin-top:2px;margin-bottom:18px;">Track prices. Save money. Get notified.</div>
            </td>
          </tr>
          <!-- Main message -->
          <tr>
            <td style="padding:0 32px 0 32px;text-align:center;">
              <div style="font-size:17px;font-weight:600;color:#0f172a;margin-bottom:10px;">
                ${isTargetHit ? "🎯 Target price reached!" : `📉 Price drop alert!`}
              </div>
              <div style="font-size:15px;color:#334155;margin-bottom:18px;">
                The price of <b>${product.name}</b> just dropped by <span style="color:#0ea5e9;font-weight:600;">${percentageDrop}%</span>!
              </div>
              <div style="font-size:32px;font-weight:700;color:#059669;line-height:1.2;margin-bottom:6px;">
                ${fmtPrice(newPrice, product.currency)}
              </div>
              <div style="font-size:15px;color:#94a3b8;text-decoration:line-through;margin-bottom:18px;">
                ${fmtPrice(oldPrice, product.currency)}
              </div>
              <a href="${product.url}" target="_blank" rel="noopener noreferrer"
                 style="display:inline-block;background:#0f172a;color:#fff;padding:14px 36px;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px;margin-top:10px;">
                View Product →
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding-top:32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">
                You're receiving this because you're tracking this product on
                <a href="${appUrl}" style="color:#64748b;text-decoration:underline;">Better Deals</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Email error:", error);
    return { error: error instanceof Error ? error.message : "Email failed" };
  }
}
