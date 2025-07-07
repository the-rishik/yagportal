const nodemailer = require('nodemailer');

// Create a transporter using Gmail SMTP
// Note: In production, you should use environment variables for credentials
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

/**
 * Send welcome email to newly created users
 * @param {string} userEmail - The user's email address
 * @param {string} firstName - The user's first name
 * @param {string} schoolName - The school name
 * @param {string} portalUrl - The portal URL
 */
const sendWelcomeEmail = async (userEmail, firstName, schoolName, portalUrl = process.env.PORTAL_URL || 'http://localhost:3001') => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: userEmail,
      subject: 'Welcome to NJYAG - Your Account is Ready!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to NJYAG!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your advisor has made an account for you.</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
              Hello ${firstName},
            </p>
            
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
              Great news! Your advisor from <strong>${schoolName}</strong> has made an account for you in our system. 
              Please login and submit your bill.
            </p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #1f2937;">Your Login Information:</h3>
              <p style="margin: 5px 0; color: #374151;"><strong>Email:</strong> ${userEmail}</p>
              <p style="margin: 5px 0; color: #374151;"><strong>Password:</strong> njyag</p>
              <p style="margin: 15px 0 0 0; color: #dc2626; font-size: 14px;">
                <strong>Important:</strong> Please change your password after your first login for security.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${portalUrl}/login" 
                 style="background: #1e40af; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                Login to Portal
              </a>
            </div>
            
            
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
              If you have any questions or need assistance, please contact your advisor or respond to this email
            </p>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="font-size: 14px; color: #6b7280; margin: 0;">
                Best regards,<br>
                NJYAG
              </p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully to:', userEmail);
    return info;
  } catch (error) {
    console.error('Error sending welcome email to:', userEmail, error);
    throw error;
  }
};

/**
 * Send bulk welcome emails to multiple users
 * @param {Array} users - Array of user objects with email, firstName, school properties
 * @param {string} portalUrl - The portal URL
 */
const sendBulkWelcomeEmails = async (users, portalUrl = process.env.PORTAL_URL || 'http://localhost:3001') => {
  const results = [];
  
  for (const user of users) {
    try {
      const result = await sendWelcomeEmail(user.email, user.firstName, user.school, portalUrl);
      results.push({ email: user.email, success: true, messageId: result.messageId });
    } catch (error) {
      results.push({ email: user.email, success: false, error: error.message });
    }
  }
  
  return results;
};

module.exports = {
  sendWelcomeEmail,
  sendBulkWelcomeEmails
}; 