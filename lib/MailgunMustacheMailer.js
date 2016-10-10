var async = require("async");
var mustache = require("mustache");

var fileSender = require("./senders/file.js");
var mailgunSender = require("./senders/mailgun.js");

// config: {
//     domain: {domain},
//     apiKey: {apiKey},
//     dryrun: {boolean}
// }

var MailgunMustacheMailer = module.exports = function(config) {
    this.config = config;
    this.sender = config.dryrun ? fileSender : mailgunSender(config);
};

MailgunMustacheMailer.prototype.sendBatch = function(template, recipients, callback) {
    async.mapLimit(recipients, 5, (recipient, callback) => {
        this.send(template, recipient, (error, mailId) => {
            if(error) {
                return callback(error);
            }

            callback(null, { email: recipient.email, mailId: mailId });
        });
    }, callback);
};

MailgunMustacheMailer.prototype.send = function(template, recipient, callback) {
    if(!recipient.email) {
        return callback(new Error("Recipient must have an email address"));
    }

    recipient.subject = mustache.render(template.subject, recipient);
    recipient.html = mustache.render(template.html, recipient);
    recipient.text = mustache.render(template.text, recipient);

    this.sender(recipient, callback);
};
