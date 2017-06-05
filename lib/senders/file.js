const fs = require("fs");
const uuid = require("uuid");

module.exports = function(config, log) {
    return (recipient, callback) => file(config, log, recipient, callback);
};

function file(config, log, recipient, callback) {
    const mailId = uuid.v4();
    fs.writeFileSync(`file-sender.${mailId}.${recipient.email}.${recipient.subject}.html`, recipient.html);
    fs.writeFileSync(`file-sender.${mailId}.${recipient.email}.${recipient.subject}.text`, recipient.text);

    log.info("file-sender wrote two files to disk");

    setImmediate(callback, null, mailId);
}
