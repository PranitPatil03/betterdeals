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

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">

          <!-- Logo -->
          <tr>
            <td style="padding-bottom:24px;text-align:center;">
              <span style="font-size:20px;font-weight:700;color:#0f172a;letter-spacing:-0.3px;">better deals</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

              <!-- Header bar -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:${isTargetHit ? "#059669" : "#0ea5e9"};padding:16px 24px;">
                    <span style="color:#ffffff;font-size:13px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;">
                      ${isTargetHit ? "🎯 Target Price Reached" : "📉 Price Drop Alert"}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Body -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px;">

                <!-- Product image -->
                ${product.image_url ? `
                <tr>
                  <td style="text-align:center;padding-bottom:20px;">
                    <img src="${product.image_url}" alt="" width="160" style="max-width:160px;height:auto;border-radius:12px;border:1px solid #e5e7eb;" />
                  </td>
                </tr>
                ` : ""}

                <!-- Product name -->
                <tr>
                  <td style="font-size:16px;font-weight:600;color:#0f172a;line-height:1.4;padding-bottom:16px;">
                    ${product.name}
                  </td>
                </tr>

                <!-- Prices -->
                <tr>
                  <td>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                      <tr>
                        <td width="50%" style="padding:16px;text-align:center;border-right:1px solid #e5e7eb;">
                          <div style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Was</div>
                          <div style="font-size:20px;color:#94a3b8;text-decoration:line-through;font-weight:500;">${fmtPrice(oldPrice, product.currency)}</div>
                        </td>
                        <td width="50%" style="padding:16px;text-align:center;">
                          <div style="font-size:11px;color:#059669;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Now</div>
                          <div style="font-size:24px;color:#0f172a;font-weight:700;">${fmtPrice(newPrice, product.currency)}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Savings badge -->
                <tr>
                  <td style="padding-top:12px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#f0fdf4;border-radius:10px;padding:12px 16px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size:13px;color:#166534;font-weight:500;">You save</td>
                              <td style="font-size:18px;color:#16a34a;font-weight:700;text-align:right;">
                                ${fmtPrice(priceDrop, product.currency)} <span style="font-size:13px;font-weight:500;color:#166534;">(${percentageDrop}%)</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                ${isTargetHit && alertPrice !== null ? `
                <!-- Target badge -->
                <tr>
                  <td style="padding-top:8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;padding:12px 16px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size:13px;color:#065f46;">Your target</td>
                              <td style="font-size:15px;color:#059669;font-weight:600;text-align:right;">${fmtPrice(alertPrice, product.currency)}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ` : ""}

                <!-- CTA button -->
                <tr>
                  <td style="padding-top:24px;text-align:center;">
                    <a href="${product.url}" target="_blank" rel="noopener noreferrer"
                       style="display:inline-block;background:#0f172a;color:#ffffff;padding:14px 36px;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px;">
                      ${isTargetHit ? "Buy Now" : "View Deal"} →
                    </a>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">
                You're receiving this because you're tracking this product on
                <a href="${appUrl}" style="color:#64748b;text-decoration:underline;">Better Deals</a>.
              </p>
              <p style="margin:8px 0 0;font-size:12px;">
                <a href="${appUrl}/dashboard" style="color:#64748b;text-decoration:underline;">Manage tracked products</a>
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
