const sendgridTransport = require('nodemailer-sendgrid-transport');
const { renderFile } = require('ejs');
const appRouteUrl = require('app-root-path');
const nodemailer = require('nodemailer');

exports.sendGrid = (emailData) => {

    const appUrlSource = `${appRouteUrl.path}/src`;
    const templateSource = `${appUrlSource}/views/emails/${emailData.template}.ejs`;

    renderFile(

        templateSource,
        {
            preheaderText: emailData.preheaderText,
            emailTitle: emailData.emailTitle,
            emailSalute: emailData.emailSalute,
            bodyOne: emailData.bodyOne,
            bodyTwo: emailData.bodyTwo,
            bodyThree: emailData.bodyThree,
            buttonText: emailData.buttonText,
            buttonUrl: emailData.buttonUrl,
        },
        async (err, html) => {

            if(err){
               console.log(err); return;
            } 

            try { 

                const transporter = nodemailer.createTransport(
                    sendgridTransport({
                        auth: {
                            api_key: process.env.SENDGRID_API_KEY
                        }
                    })
                )

                const mailData = {

                    to: emailData.email,
                    from: `${emailData.fromName} <${process.env.FROM_EMAIL}>`,
                    subject: emailData.emailTitle,
                    html
                }

                await transporter.sendMail(mailData);

            } catch (err) {
                console.log(err);
                return err;
            }
        }
    );

}