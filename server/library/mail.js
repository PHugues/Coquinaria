module.exports = {

    // See https://nodemailer.com/message/
    /**
     * Send an email
     * @param {Object} params Necessary parameters to send the mail
     * @param {String} params.from Sender of the mail
     * @param {String|Array<String>} params.to Recipient of the mail (Comma separated list or an array)
     * @param {String|Array<String>} params.cc Recipient in copy of the mail (Comma separated list or an array)
     * @param {String|Array<String>} params.bcc Recipient in hidden copy of the mail (Comma separated list or an array)
     * @param {String} params.subjec Subject of the mail
     * @param {String} params.body Content of the mail
     * @param {*} params.attachments Attachments of the mail (Array of attachments which are object). Check the wiki for more informations
     * @param {Boolean} isHtml If the content is html
     */
    SendMail: function(params, isHtml, onComplete) {
        return new Promise(async (resolve, reject) => {
            try {
                let mailOptions = {
                    from: params & params.from ? params.from : '"Coquinaria" <coquinaria@pierre-hugues.fr>',
                    to: params && params.to ? params.to : "",
                    subject: params && params.subject ? params.subject : "",
                    cc: params && params.cc ? params.cc : "",
                    bcc: params && params.bcc ? params.bcc : "",
                    attachments: params && params.attachments ? params.attachments : "",
                }
                isHtml ? mailOptions.html = params.body : mailOptions.text = params.body;
                let mail = await transporter.sendMail(mailOptions);
                logger.info(`Message sent to ${params.to}. [Subject: ${params.subject}]`);
                onComplete ? onComplete({result: true}) : resolve();
            } catch (error) {
                let msg = `[SendMail] ${error.message || error.error || error}`;
                onComplete ? onComplete({result: false, error: msg}) : reject(msg);
            }
        });
    }
}