module.exports = {

    // See https://nodemailer.com/message/
    /**
     * Send an email
     * @param {Object} params Necessary parameters to send the mail
     * - to : Recipient of the mail (Comma separated list or an array)
     * - cc : Recipient in copy of the mail (Comma separated list or an array)
     * - bcc : Recipient in hidden copy of the mail (Comma separated list or an array)
     * - subject: Subject of the mail
     * - body : Content of the mail
     * - attachments : Attachments of the mail (Array of attachments which are object). Check the wiki for more informations
     * @param {Boolean} isHtml If the content is html
     */
    SendMail: function(params, isHtml) {
        return new Promise(async (resolve, reject) => {
            try {
                let mailOptions = {
                    from: '"Coquinaria" <coquinaria@pierre-hugues.fr>',
                    to: params && params.to ? params.to : "",
                    subject: params && params.subject ? params.subject : "",
                    cc: params && params.cc ? params.cc : "",
                    bcc: params && params.bcc ? params.bcc : "",
                    attachments: params && params.attachments ? params.attachments : "",
                }
                isHtml ? mailOptions.html = params.body : mailOptions.text = params.body;
                let mail = await transporter.sendMail(mailOptions);
                logger.info(`Message sent to ${params.to}. [Subject: ${params.subject}]`);
                resolve();
            } catch (error) {
                let msg = `[SendMail] ${error.message || error.error || error}`;
                reject(msg);
            }
        });
    }
}