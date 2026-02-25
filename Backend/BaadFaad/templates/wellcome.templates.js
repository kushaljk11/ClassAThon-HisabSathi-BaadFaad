const BRAND_COLORS = {
	primary: "#34d399",
	primaryDark: "#10b981",
	textDark: "#0f172a",
	textMuted: "#64748b",
	pageBg: "#f4f4f5",
	cardBg: "#ffffff",
	border: "#d4d4d8",
};

export const createWelcomeTemplate = ({
	name = "there",
	loginLink = "#",
}) => {
	const subject = "Welcome to BaadFaad 🎉";

	const text = `Hi ${name},\n\nWelcome to BaadFaad! Split bills, track payments, and settle faster with your group.\nStart here: ${loginLink}\n\n- Team BaadFaad`;

	const html = `
	<div style="background:${BRAND_COLORS.pageBg};padding:24px;font-family:Arial,sans-serif;color:${BRAND_COLORS.textDark};">
		<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:${BRAND_COLORS.cardBg};border:1px solid ${BRAND_COLORS.border};border-radius:14px;overflow:hidden;">
			<tr>
				<td style="background:${BRAND_COLORS.primary};padding:18px 24px;font-size:24px;font-weight:700;color:${BRAND_COLORS.textDark};">
					Welcome to BaadFaad
				</td>
			</tr>
			<tr>
				<td style="padding:24px;line-height:1.6;">
					<p style="margin:0 0 12px;font-size:16px;">Hi ${name},</p>
					<p style="margin:0 0 12px;color:${BRAND_COLORS.textMuted};">
						Your account is ready. You can now create groups, split expenses, and keep everyone on the same page without awkward money follow-ups.
					</p>
					<div style="margin:16px 0;padding:16px;border-radius:12px;background:#ecfdf5;border:1px solid #a7f3d0;">
						<p style="margin:0;font-size:14px;color:${BRAND_COLORS.textMuted};">Quick Start</p>
						<p style="margin:6px 0 0;font-size:15px;color:${BRAND_COLORS.textDark};">Create a session → Add participants → Upload bill → Split instantly.</p>
					</div>
					<a href="${loginLink}" style="display:inline-block;margin-top:8px;background:${BRAND_COLORS.primaryDark};color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:700;">
						Go to Dashboard
					</a>
					<p style="margin:20px 0 0;font-size:13px;color:${BRAND_COLORS.textMuted};">Thanks for joining. Let’s split bills, not friendships.</p>
				</td>
			</tr>
		</table>
	</div>`;

	return { subject, text, html };
};

export default createWelcomeTemplate;
