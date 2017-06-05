const c = require("chai");

const index = require("../index");
const MailgunMustacheMailer = require("../lib/MailgunMustacheMailer");

describe("index", () => {
    it("is identical to MailgunMustacheMailer", () => {
        c.expect(index).to.equal(MailgunMustacheMailer);
    });
});
