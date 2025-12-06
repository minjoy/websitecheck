import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(email: string, code: string) {
  const mailOptions = {
    from: `"마켓플레이스 딜" <${process.env.SMTP_USER}>`,
    to: email,
    subject: '[마켓플레이스 딜] 이메일 인증 코드',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0;">마켓플레이스 딜</h1>
        </div>

        <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-top: 20px;">
          <h2 style="color: #333;">이메일 인증 코드</h2>
          <p style="color: #666; font-size: 16px;">회원가입을 완료하려면 아래 인증 코드를 입력해주세요.</p>

          <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="color: #667eea; font-size: 36px; letter-spacing: 8px; margin: 0;">${code}</h1>
          </div>

          <p style="color: #999; font-size: 14px;">이 코드는 <strong>5분</strong> 동안 유효합니다.</p>
          <p style="color: #999; font-size: 14px;">본인이 요청하지 않은 경우, 이 메일을 무시해주세요.</p>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© 2025 마켓플레이스 딜. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  const mailOptions = {
    from: `"마켓플레이스 딜" <${process.env.SMTP_USER}>`,
    to: email,
    subject: '[마켓플레이스 딜] 비밀번호 재설정',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0;">마켓플레이스 딜</h1>
        </div>

        <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-top: 20px;">
          <h2 style="color: #333;">비밀번호 재설정</h2>
          <p style="color: #666; font-size: 16px;">비밀번호를 재설정하려면 아래 버튼을 클릭해주세요.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: bold;">
              비밀번호 재설정하기
            </a>
          </div>

          <p style="color: #999; font-size: 14px;">또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
          <p style="color: #667eea; font-size: 12px; word-break: break-all;">${resetLink}</p>

          <p style="color: #999; font-size: 14px; margin-top: 20px;">이 링크는 <strong>1시간</strong> 동안 유효합니다.</p>
          <p style="color: #999; font-size: 14px;">본인이 요청하지 않은 경우, 이 메일을 무시해주세요.</p>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© 2025 마켓플레이스 딜. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

export function generateVerificationCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
