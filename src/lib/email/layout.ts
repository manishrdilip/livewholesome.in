const EMERALD = "#0c4a34";
const GOLD = "#c9a227";
const CREAM = "#f7f3e8";
const INK = "#16211c";

export function renderEmailShell(opts: {
  preheader: string;
  heading: string;
  bodyHtml: string;
}): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(opts.heading)}</title>
  </head>
  <body style="margin:0;padding:0;background:${CREAM};font-family:Arial,Helvetica,sans-serif;color:${INK};">
    <span style="display:none;font-size:1px;color:${CREAM};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
      ${escapeHtml(opts.preheader)}
    </span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CREAM};padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid rgba(22,33,28,0.08);">
            <tr>
              <td style="background:${EMERALD};padding:28px 32px;">
                <div style="color:${CREAM};font-size:20px;font-weight:bold;letter-spacing:1px;">WHOLESOME</div>
                <div style="color:${GOLD};font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-top:2px;">Complete. Whole. Full.</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px;font-size:20px;color:${EMERALD};">${escapeHtml(opts.heading)}</h1>
                ${opts.bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:2px solid ${GOLD};background:${CREAM};">
                <div style="font-size:12px;color:rgba(22,33,28,0.6);">
                  livewholesome.in — Sprouted multigrain health mix, shipped from Vellore, Tamil Nadu.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
