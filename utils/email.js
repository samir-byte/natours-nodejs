const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

module.exports = class Email {
    constructor(user, url){
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Samir ${process.env.EMAIL_FROM}`;
    }

    newTransport(){
        if(process.env.NODE_ENV === 'production'){
            //transporter for production environment
            return 1
        }
        else{
            //transporter for dev
            return nodemailer.createTransport({
                // service: 'gmail',
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            })
        }
    }

    async send(template, subject){
        //Send the actual email
        /*
        1) Render HTML based on a pug template
        2) Define email options
        3) create a transport and send email
        */
       const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`,{
            firstName: this.firstName,
            url: this.url,
            subject  
       });

       const mailOptions = {
           from: this.from,
           to: this.to,
           subject,
           html,
           text: htmlToText(html)

       }

       await this.newTransport().sendMail(mailOptions)
       
    }

    async sendWelcome(){
        await this.send('welcome', 'Welcome to the Natours Family!');
    }

    async sendPasswordReset(){
        await this.send('passwordReset', 'Your password reset token (valid for only 10mins)')
    }
}

/*
this is basic email sending
we updated this with templates email sending with new class
*/
// const sendEmail = async options => {
//     /*
//     1. Create a transporter
//     2. Define the email options
//     3. Send the email
//     */

//     let transporter = nodemailer.createTransport({
//         // service: 'gmail',
//         host: process.env.EMAIL_HOST,
//         port: process.env.EMAIL_PORT,
//         auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS
//         }
//         //activate in gmail less secure app option FOR GMAIL AND ADD SERVICE: GMAIL IN TRANSPORTER
//     })

//     const mailOptions = {
//         from: 'test@natours.io',
//         to: options.email,
//         subject: options.subject,
//         text: options.message
//     }

//     await transporter.sendMail(mailOptions)
// }

// module.exports = sendEmail;