const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  await sgMail.send({
    to,
    from: 'abhikumar9166905548@gmail.com',
    subject,
    html,
  });
};

module.exports = sendEmail;
