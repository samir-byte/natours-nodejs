const nodemailer = require('nodemailer');

const sendEmail = async options => {
    /*
    1. Create a transporter
    2. Define the email options
    3. Send the email
    */

    let transporter = nodemailer.createTransport({
        // service: 'gmail',
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
        //activate in gmail less secure app option FOR GMAIL AND ADD SERVICE: GMAIL IN TRANSPORTER
    })

    const mailOptions = {
        from: 'test@natours.io',
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    await transporter.sendMail(mailOptions)
}

module.exports = sendEmail;