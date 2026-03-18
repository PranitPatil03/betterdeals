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
  return name.length <= max ? name : name.slice(0, max).trimEnd() + "...";
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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

    const rawDrop = oldPrice - newPrice;
    const priceDrop = Math.max(0, rawDrop);
    const percentageDrop = oldPrice > 0 ? (priceDrop / oldPrice) * 100 : 0;
    const percentLabel = `${percentageDrop.toFixed(1)}%`;
    const isTargetHit = options?.isTargetHit === true;
    const alertPrice = options?.alertPrice ?? null;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://betterdeals.vercel.app";
    const cleanAppUrl = appUrl.replace(/\/$/, "");
    const dashboardUrl = `${cleanAppUrl}/dashboard`;

    const currentPriceLabel = fmtPrice(newPrice, product.currency);
    const previousPriceLabel = fmtPrice(oldPrice, product.currency);
    const savingsLabel = fmtPrice(priceDrop, product.currency);
    const alertPriceLabel =
      alertPrice !== null
        ? fmtPrice(alertPrice, product.currency)
        : null;

    const safeProductName = escapeHtml(product.name);
    const safeProductUrl = escapeHtml(product.url);
    const safeImageUrl = product.image_url ? escapeHtml(product.image_url) : "";

    const subject = isTargetHit
      ? `Your target price was hit — ${shortName(product.name)} dropped to ${currentPriceLabel}`
      : `Price dropped ${percentLabel} — ${shortName(product.name)} is now ${currentPriceLabel}`;

    const plainText = [
      isTargetHit ? "Your target price was reached." : "Price drop detected.",
      "",
      `Product: ${product.name}`,
      `Current price: ${currentPriceLabel}`,
      `Previous price: ${previousPriceLabel}`,
      `You save: ${savingsLabel} (${percentLabel})`,
      alertPriceLabel ? `Alert price: ${alertPriceLabel}` : undefined,
      `View product: ${product.url}`,
      "",
      `Manage tracked products: ${dashboardUrl}`,
    ]
      .filter(Boolean)
      .join("\n");

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: userEmail,
      subject,
      text: plainText,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#eef2f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eef2f7;padding:28px 14px;">
    <tr>
      <td align="center">
        <table role="presentation" width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;border-radius:20px;overflow:hidden;background:#ffffff;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
          <tr>
            <td style="padding:22px 28px 18px 28px;background:linear-gradient(135deg,#0f172a 0%,#1d4ed8 100%);">
              <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.2px;">Better Deals</div>
              <div style="font-size:13px;color:#dbeafe;margin-top:4px;">Smart price tracking and drop alerts</div>
            </td>
          </tr>

          <tr>
            <td style="padding:22px 28px 0 28px;">
              <div style="display:inline-block;padding:6px 10px;border-radius:999px;background:${isTargetHit ? "#dcfce7" : "#dbeafe"};color:${isTargetHit ? "#166534" : "#1e40af"};font-size:12px;font-weight:700;letter-spacing:0.2px;">
                ${isTargetHit ? "TARGET REACHED" : "PRICE DROP DETECTED"}
              </div>
              <h1 style="margin:12px 0 8px 0;font-size:22px;line-height:1.3;color:#0f172a;">
                ${safeProductName}
              </h1>
              <p style="margin:0;font-size:14px;line-height:1.6;color:#475569;">
                ${isTargetHit
          ? `Great news. Your target price${alertPriceLabel ? ` (${alertPriceLabel})` : ""} has been reached.`
          : `The price moved down by <strong style="color:#0f172a;">${percentLabel}</strong> since the last check.`}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 28px 0 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:top;padding-right:18px;">
                    ${safeImageUrl
          ? `<img src="${safeImageUrl}" alt="${safeProductName}" style="height:110px;width:110px;border-radius:14px;object-fit:contain;background:#f8fafc;display:block;" />`
          : ""}
                  </td>
                  <td style="vertical-align:top;">
                    <div style="font-size:13px;color:#64748b;margin-bottom:6px;">Current price</div>
                    <div style="font-size:34px;font-weight:800;color:#0f172a;line-height:1.15;">${currentPriceLabel}</div>
                    <div style="margin-top:6px;font-size:14px;color:#64748b;">
                      Was <span style="text-decoration:line-through;">${previousPriceLabel}</span>
                    </div>
                    <div style="margin-top:4px;font-size:14px;color:#0f766e;font-weight:700;">
                      You save ${savingsLabel} (${percentLabel})
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 28px 0 28px;">
              <a href="${safeProductUrl}" target="_blank" rel="noopener noreferrer"
                 style="display:inline-block;background:#1d4ed8;color:#ffffff;padding:12px 22px;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;">
                View Product
              </a>
              <a href="${dashboardUrl}" target="_blank" rel="noopener noreferrer"
                 style="display:inline-block;margin-left:10px;background:#eff6ff;color:#1d4ed8;padding:12px 22px;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;">
                Open Dashboard
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding:22px 28px 26px 28px;">
              <div style="padding:14px 16px;border-radius:12px;background:#f8fafc;">
                <p style="margin:0 0 6px 0;font-size:13px;color:#334155;font-weight:600;">Why you received this email</p>
                <p style="margin:0;font-size:12px;color:#64748b;line-height:1.6;">
                  You are receiving this alert because this product is tracked in your Better Deals dashboard.
                  ${alertPriceLabel ? ` Your alert threshold is ${alertPriceLabel}.` : ""}
                </p>
              </div>
              <p style="margin:14px 0 0 0;font-size:12px;color:#94a3b8;line-height:1.5;">
                Better Deals, price intelligence platform.
                <a href="${dashboardUrl}" style="color:#64748b;text-decoration:underline;">Manage alerts</a>
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
