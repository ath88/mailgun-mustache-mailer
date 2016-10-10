var request = require("request");
var log = console;

module.exports = function(config) {
    return mailgunSender.bind(null, config);
};

function mailgunSender(config, recipient, callback) {
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
            text: recipient.text
        }
    };

    request.post(requestOptions, (error, response, body) => {
        if(error) {
            log.error(error);
        }

        log.info("Sent email to [%s]", recipient.email);
        callback(null, body.id);
    });
}
