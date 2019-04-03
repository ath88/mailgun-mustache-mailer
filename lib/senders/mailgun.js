const request = require("request");

module.exports = function(config, log) {
    return (recipient, mailgunOptions, callback) => mailgun(config, log, recipient, mailgunOptions, callback);
};

function mailgun(config, log, recipient, mailgunOptions, callback) {
    var requestOptions = {
        url: "https://api.mailgun.net/v3/" + config.domain + "/messages",
        auth: {
            user: "api",
            pass: config.apiKey
        },
        formData: {
            from: config.from,
            to: recipient.name + " <" + recipient.email + ">",
            subject: recipient.subject,
            html: recipient.html,
            text: recipient.text,
            ...mailgunOptions
        }
    };

    request.post(requestOptions, (error, response, body) => {
        if(error) return callback(error);

        log.info(`Sent email to ${recipient.email}`);
        callback(null, body.id);
    });
}
