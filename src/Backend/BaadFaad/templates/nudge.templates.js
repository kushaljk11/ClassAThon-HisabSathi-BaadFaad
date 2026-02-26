/**
 * @file templates/nudge.templates.js
 * @description Branded HTML email template for payment nudge reminders.
 * Returns { subject, text, html } ready for Nodemailer.
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
 * Build a branded nudge-reminder email.
 * @param {Object} opts
 * @param {string} opts.recipientName
 * @param {string} opts.senderName
 * @param {string} opts.groupName
 * @param {string} opts.amount
 * @param {string} opts.currency
 * @param {string} opts.dueDate
 * @param {string} opts.payLink
 * @returns {{ subject: string, text: string, html: string }}
 */
const createNudgeTemplate = ({
	recipientName = "Friend",
	senderName = "Your friend",
	groupName = "your group",
	amount = "0",
	currency = "NPR",
	dueDate = "soon",
	payLink = "#",
}) => {
	const subject = `Friendly reminder: ${currency} ${amount} pending in ${groupName}`;

	const text = `Hi ${recipientName},\n\nGentle reminder for your pending share in ${groupName} to ${recipientName}.\nPending amount: ${currency} ${amount}\nDue date: ${dueDate}\nPay here: ${payLink}\n\n- BaadFaad`;

	const html = `
	<div style="background:${BRAND_COLORS.pageBg};padding:24px;font-family:Arial,sans-serif;color:${BRAND_COLORS.textDark};">
		<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:${BRAND_COLORS.cardBg};border:1px solid ${BRAND_COLORS.border};border-radius:14px;overflow:hidden;">
			<tr>
				<td style="background:${BRAND_COLORS.primary};padding:18px 24px;font-size:22px;font-weight:700;color:${BRAND_COLORS.textDark};">
					BaadFaad • Payment Nudge
				</td>
			</tr>
			<tr>
				<td style="padding:24px;line-height:1.6;">
					<p style="margin:0 0 12px;font-size:16px;">Hi ${recipientName},</p>
					<p style="margin:0 0 12px;color:${BRAND_COLORS.textMuted};">
						Gentle reminder for your pending share in <strong>${groupName}</strong> to <strong>${recipientName}</strong>.
					</p>
					<div style="margin:16px 0;padding:16px;border-radius:12px;background:#ecfdf5;border:1px solid #a7f3d0;">
						<p style="margin:0;font-size:14px;color:${BRAND_COLORS.textMuted};">Pending Amount</p>
						<p style="margin:4px 0 0;font-size:28px;font-weight:700;color:${BRAND_COLORS.primaryDark};">${currency} ${amount}</p>
						<p style="margin:8px 0 0;font-size:13px;color:${BRAND_COLORS.textMuted};">Due: ${dueDate}</p>
					</div>
					<a href="${payLink}" style="display:inline-block;margin-top:8px;background:${BRAND_COLORS.primaryDark};color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:700;">
						Settle Now
					</a>
					<p style="margin:20px 0 0;font-size:13px;color:${BRAND_COLORS.textMuted};">Keep friendships smooth. Split smart with BaadFaad.</p>
				</td>
			</tr>
		</table>
	</div>`;

	return { subject, text, html };
};

export default createNudgeTemplate;
