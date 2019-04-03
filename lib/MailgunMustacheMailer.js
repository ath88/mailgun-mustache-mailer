const _ = require("lodash");
const async = require("async");
const mustache = require("mustache");

const fileSender = require("./senders/file");
const mailgunSender = require("./senders/mailgun");

const sendingParallelism = 5;

// config: {
//     domain: {domain},
//     apiKey: {apiKey},
//     dryrun: {boolean}
// }

var MailgunMustacheMailer = module.exports = function(config, log) {
    this.config = config;
    this.log = log || { info: console.log };

    this.config.sendingParallelism = config.sendingParallelism || sendingParallelism;
    this.sender = config.dryrun ? fileSender(config, log) : mailgunSender(config, log);
};

MailgunMustacheMailer.prototype.sendBatch = function(template, recipients, mailgunOptions, callback) {
    if(!callback) {
        callback = mailgunOptions;
        mailgunOptions = {};
    }

    if(!_.every(recipients, "email")) return setImmediate(callback, new Error("All recipients must have an email address"));

    async.mapLimit(recipients, this.config.sendingParallelism, (recipient, callback) => {
        this.send(template, recipient, mailgunOptions, (error, mailId) => {
            if(error) return callback(null, { email: recipient.email, error });

            callback(null, { email: recipient.email, mailId: mailId });
        });
    }, callback);
};

MailgunMustacheMailer.prototype.send = function(template, recipient, mailgunOptions, callback) {
    if(!callback) {
        callback = mailgunOptions;
        mailgunOptions = {};
    }

    if(!recipient.email) return setImmediate(callback, new Error("Recipient must have an email address"));

    recipient.subject = mustache.render(template.subject, recipient);
    recipient.html = mustache.render(template.html, recipient);
    recipient.text = mustache.render(template.text, recipient);

    this.sender(recipient, mailgunOptions, callback);
};
