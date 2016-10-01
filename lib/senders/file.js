var fs = require("fs");
var log = console;

module.exports = function fileSender(recipient, callback) {
    fs.writeFileSync("file-sender." + recipient.email + ".html", recipient.html);
    fs.writeFileSync("file-sender." + recipient.email + ".text", recipient.text);

    log.info("file-sender wrote two files to disk");

    callback(null, "some-sent-id");
};
