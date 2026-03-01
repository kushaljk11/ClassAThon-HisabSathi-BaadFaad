/**
 * @file templates/payment.templates.js
 * @description Branded HTML email template for payment confirmation receipts.
 * Returns { subject, text, html } ready for Mailjet.
 */

/** BaadFaad brand colour palette for email templates. */
const BRAND_COLORS = {
	primary: "#34d399",
	primaryDark: "#10b981",
	textDark: "#0f172a",
	textMuted: "#64748b",
	pageBg: "#f4f4f5",
	cardBg: "#ffffff",
	border: "#d4d4d8",
};

/**
 * Generate a payment confirmation email template.
 * @param {object} opts
 * @param {string} opts.recipientName
 * @param {string|number} opts.amount
 * @param {string} opts.currency
 * @param {string} opts.groupName
 * @param {string} opts.paidTo
 * @param {string} opts.paymentMethod
 * @param {string} opts.paymentDate
 * @param {string} opts.transactionId
 * @returns {{ subject: string, text: string, html: string }}
 */
export const createPaymentTemplate = ({
	recipientName = "there",
	amount = "0",
	currency = "NPR",
	groupName = "your group",
	paidTo = "a participant",
	paymentMethod = "Online",
	paymentDate = new Date().toLocaleDateString(),
	transactionId = "N/A",
}) => {
	const subject = `Payment received: ${currency} ${amount}`;

	const text = `Hi ${recipientName},\n\nYour payment of ${currency} ${amount} for ${groupName} was recorded successfully.\nPaid to: ${paidTo}\nMethod: ${paymentMethod}\nDate: ${paymentDate}\nTransaction ID: ${transactionId}\n\n- BaadFaad`;

	const html = `
	<div style="background:${BRAND_COLORS.pageBg};padding:24px;font-family:Arial,sans-serif;color:${BRAND_COLORS.textDark};">
		<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:${BRAND_COLORS.cardBg};border:1px solid ${BRAND_COLORS.border};border-radius:14px;overflow:hidden;">
			<tr>
				<td style="background:${BRAND_COLORS.primary};padding:18px 24px;font-size:22px;font-weight:700;color:${BRAND_COLORS.textDark};">
					BaadFaad • Payment Receipt
				</td>
			</tr>
			<tr>
				<td style="padding:24px;line-height:1.6;">
					<p style="margin:0 0 12px;font-size:16px;">Hi ${recipientName},</p>
					<p style="margin:0 0 12px;color:${BRAND_COLORS.textMuted};">
						Your payment has been recorded successfully for <strong>${groupName}</strong>.
					</p>
					<div style="margin:16px 0;padding:16px;border-radius:12px;background:#ecfdf5;border:1px solid #a7f3d0;">
						<p style="margin:0;font-size:14px;color:${BRAND_COLORS.textMuted};">Amount Paid</p>
						<p style="margin:4px 0 10px;font-size:28px;font-weight:700;color:${BRAND_COLORS.primaryDark};">${currency} ${amount}</p>
						<p style="margin:0;font-size:13px;color:${BRAND_COLORS.textMuted};">Paid to: ${paidTo}</p>
						<p style="margin:2px 0 0;font-size:13px;color:${BRAND_COLORS.textMuted};">Method: ${paymentMethod}</p>
						<p style="margin:2px 0 0;font-size:13px;color:${BRAND_COLORS.textMuted};">Date: ${paymentDate}</p>
						<p style="margin:2px 0 0;font-size:13px;color:${BRAND_COLORS.textMuted};">Txn ID: ${transactionId}</p>
					</div>
					<p style="margin:16px 0 0;font-size:13px;color:${BRAND_COLORS.textMuted};">Keep this email as your payment reference.</p>
				</td>
			</tr>
		</table>
	</div>`;

	return { subject, text, html };
};

export default createPaymentTemplate;
