import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can change this if using another provider
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendResetEmail = async (toEmail, otpCode) => {
    try {
        const mailOptions = {
            from: `"DailyBox" <${process.env.SMTP_USER}>`,
            to: toEmail,
            subject: 'DailyBox Password Reset Code',
            text: `Your password reset code is: ${otpCode}. It is valid for 15 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #333; text-align: center;">DailyBox Password Reset</h2>
                    <p style="color: #555; font-size: 16px;">Hello,</p>
                    <p style="color: #555; font-size: 16px;">We received a request to reset your password. Use the following OTP code to reset it. This code will expire in 15 minutes.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="display: inline-block; padding: 15px 25px; background-color: #f4f4f4; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333;">
                            ${otpCode}
                        </span>
                    </div>
                    <p style="color: #555; font-size: 14px;">If you didn't request a password reset, you can safely ignore this email.</p>
                    <p style="color: #999; font-size: 12px; text-align: center; margin-top: 40px;">DailyBox Team</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending reset email:', error);
        return false;
    }
};
