const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a testing account on Ethereal Email if no SMTP config is provided
  // In production, these should come from environment variables
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_EMAIL;
  const pass = process.env.SMTP_PASSWORD;

  let transporter;

  if (host && port && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      auth: {
        user,
        pass
      }
    });
  } else {
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
    console.log('Using Ethereal Email for testing. Check the console for the email link.');
  }

  const message = {
    from: `${process.env.FROM_NAME || 'FitNova'} <${process.env.FROM_EMAIL || 'noreply@fitnova.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
  
  // Preview only available when sending through an Ethereal account
  if (!host) {
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }
};

module.exports = sendEmail;
