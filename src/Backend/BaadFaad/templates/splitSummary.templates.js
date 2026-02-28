/**
 * @file templates/splitSummary.templates.js
 * @description Branded HTML email template for detailed split summary.
 * Includes per-participant breakdown table. Returns { subject, text, html }.
 */

/** BaadFaad brand colour palette for email templates. */
const BRAND_COLORS = {
	primary: "#34d399",
	primaryDark: "#059669",
	pageBg: "#f4f4f5",
	cardBg: "#ffffff",
	border: "#e4e4e7",
	textDark: "#18181b",
	textMuted: "#71717a",
};

/**
 * Build HTML table rows for each participant's share breakdown.
 * @param {Array<{name:string, share:number, amountPaid:number, balanceDue:number}>} participants
 * @returns {string} HTML <tr> elements
 */
function buildParticipantRows(participants) {
	return participants
		.map(
			(p) => {
				const due = Number(p.balanceDue || 0);
				const payTo = due <= 0 ? "None" : (p.paidByName ? `To be paid to ${p.paidByName}` : "None");
				return `
		<tr>
			<td style="padding:8px 12px;border-bottom:1px solid ${BRAND_COLORS.border};font-size:14px;">${p.name}</td>
			<td style="padding:8px 12px;border-bottom:1px solid ${BRAND_COLORS.border};font-size:14px;text-align:right;">NPR ${Number(p.share).toLocaleString()}</td>
			<td style="padding:8px 12px;border-bottom:1px solid ${BRAND_COLORS.border};font-size:14px;text-align:right;color:${BRAND_COLORS.primaryDark};">NPR ${Number(p.amountPaid).toLocaleString()}</td>
			<td style="padding:8px 12px;border-bottom:1px solid ${BRAND_COLORS.border};font-size:14px;text-align:right;color:${p.balanceDue > 0 ? "#ef4444" : BRAND_COLORS.primaryDark};">${p.balanceDue > 0 ? "NPR " + Number(p.balanceDue).toLocaleString() : "Settled"}</td>
			<td style="padding:8px 12px;border-bottom:1px solid ${BRAND_COLORS.border};font-size:14px;text-align:right;color:${BRAND_COLORS.textMuted};">${payTo}</td>
		</tr>`;
			}
		)
		.join("");
}

/**
 * Build a plain-text version of the participant table.
 */
function buildParticipantText(participants) {
	return participants
		.map(
			(p) => {
				const due = Number(p.balanceDue || 0);
				const payTo = due <= 0 ? " | Pay to: None" : (p.paidByName ? ` | Pay to: ${p.paidByName}` : " | Pay to: None");
				return `  • ${p.name}: Share NPR ${p.share} | Paid NPR ${p.amountPaid} | Due NPR ${p.balanceDue}${payTo}`;
			}
		)
		.join("\n");
}

/**
 * @param {object} opts
 * @param {string} opts.recipientName
 * @param {string} opts.groupName
 * @param {number} opts.totalAmount
 * @param {number} opts.participantCount
 * @param {number} opts.recipientShare   — this recipient's share
 * @param {number} opts.recipientPaid    — how much this recipient has paid
 * @param {number} opts.recipientDue     — balance due for this recipient
 * @param {Array}  opts.participants     — [{ name, share, amountPaid, balanceDue }]
 */
export const createSplitSummaryTemplate = ({
	recipientName = "Friend",
	groupName = "your group",
	totalAmount = 0,
	participantCount = 0,
	recipientShare = 0,
	recipientPaid = 0,
	recipientDue = 0,
	participants = [],
}) => {
	const subject = `BaadFaad — Your split summary for ${groupName} (NPR ${Number(totalAmount).toLocaleString()})`;

	const text = `Hi ${recipientName},

Here's the split summary for "${groupName}".

Total Bill: NPR ${Number(totalAmount).toLocaleString()}
Split among: ${participantCount} participants

Your share : NPR ${Number(recipientShare).toLocaleString()}
Amount paid : NPR ${Number(recipientPaid).toLocaleString()}
Balance due : NPR ${Number(recipientDue).toLocaleString()}

--- All Participants ---
${buildParticipantText(participants)}

Thanks for using BaadFaad!`;

	const html = `
	<div style="background:${BRAND_COLORS.pageBg};padding:24px;font-family:Arial,sans-serif;color:${BRAND_COLORS.textDark};">
		<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:${BRAND_COLORS.cardBg};border:1px solid ${BRAND_COLORS.border};border-radius:14px;overflow:hidden;">
			<!-- Header -->
			<tr>
				<td style="background:${BRAND_COLORS.primary};padding:18px 24px;font-size:22px;font-weight:700;color:${BRAND_COLORS.textDark};">
					BaadFaad • Split Summary
				</td>
			</tr>

			<tr>
				<td style="padding:24px;line-height:1.6;">
					<p style="margin:0 0 12px;font-size:16px;">Hi ${recipientName},</p>
					<p style="margin:0 0 16px;color:${BRAND_COLORS.textMuted};">
						Here's the detailed split summary for <strong>${groupName}</strong>.
					</p>

					<!-- Total Bill Card -->
					<div style="margin:0 0 20px;padding:16px;border-radius:12px;background:#ecfdf5;border:1px solid #a7f3d0;">
						<p style="margin:0;font-size:13px;color:${BRAND_COLORS.textMuted};text-transform:uppercase;letter-spacing:1px;">Total Bill</p>
						<p style="margin:4px 0 0;font-size:32px;font-weight:700;color:${BRAND_COLORS.primaryDark};">NPR ${Number(totalAmount).toLocaleString()}</p>
						<p style="margin:6px 0 0;font-size:13px;color:${BRAND_COLORS.textMuted};">Split equally among ${participantCount} participant${participantCount !== 1 ? "s" : ""}</p>
					</div>

					<!-- Your Summary -->
					<div style="margin:0 0 20px;padding:16px;border-radius:12px;background:#fefce8;border:1px solid #fde68a;">
						<p style="margin:0;font-size:13px;color:${BRAND_COLORS.textMuted};text-transform:uppercase;letter-spacing:1px;">Your Summary</p>
						<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:8px;">
							<tr>
								<td style="font-size:14px;padding:4px 0;color:${BRAND_COLORS.textMuted};">Your Share</td>
								<td style="font-size:14px;padding:4px 0;text-align:right;font-weight:700;">NPR ${Number(recipientShare).toLocaleString()}</td>
							</tr>
							<tr>
								<td style="font-size:14px;padding:4px 0;color:${BRAND_COLORS.textMuted};">Amount Paid</td>
								<td style="font-size:14px;padding:4px 0;text-align:right;font-weight:700;color:${BRAND_COLORS.primaryDark};">NPR ${Number(recipientPaid).toLocaleString()}</td>
							</tr>
							<tr>
								<td style="font-size:14px;padding:4px 0;color:${BRAND_COLORS.textMuted};">Balance Due</td>
								<td style="font-size:14px;padding:4px 0;text-align:right;font-weight:700;color:${recipientDue > 0 ? "#ef4444" : BRAND_COLORS.primaryDark};">${recipientDue > 0 ? "NPR " + Number(recipientDue).toLocaleString() : "Settled ✓"}</td>
							</tr>
						</table>
					</div>

					<!-- All Participants Table -->
					<p style="margin:0 0 8px;font-size:14px;font-weight:700;">All Participants</p>
					<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid ${BRAND_COLORS.border};border-radius:8px;overflow:hidden;">
						<tr style="background:#f8fafc;">
							<th style="padding:10px 12px;text-align:left;font-size:12px;text-transform:uppercase;color:${BRAND_COLORS.textMuted};letter-spacing:0.5px;">Name</th>
							<th style="padding:10px 12px;text-align:right;font-size:12px;text-transform:uppercase;color:${BRAND_COLORS.textMuted};letter-spacing:0.5px;">Share</th>
							<th style="padding:10px 12px;text-align:right;font-size:12px;text-transform:uppercase;color:${BRAND_COLORS.textMuted};letter-spacing:0.5px;">Paid</th>
							<th style="padding:10px 12px;text-align:right;font-size:12px;text-transform:uppercase;color:${BRAND_COLORS.textMuted};letter-spacing:0.5px;">Due</th>
							<th style="padding:10px 12px;text-align:right;font-size:12px;text-transform:uppercase;color:${BRAND_COLORS.textMuted};letter-spacing:0.5px;">Pay To</th>
						</tr>
						${buildParticipantRows(participants)}
					</table>

					<p style="margin:20px 0 0;font-size:13px;color:${BRAND_COLORS.textMuted};">Split smart. Stay friends. — BaadFaad</p>
				</td>
			</tr>
		</table>
	</div>`;

	return { subject, text, html };
};

export default createSplitSummaryTemplate;
