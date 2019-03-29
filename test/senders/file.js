const s = require("sinon");
const c = require("chai").use(require("sinon-chai"));
const proxyquire = require("proxyquire");

const testSubject = "../../lib/senders/file";
describe("file sender", () => {
    let fs, uuid, sender, file, mail, log;

    beforeEach(() => {
        mail = {
            email: "asbjoern@deranged.dk",
            subject: "This email is important",
            text: "Read this!",
            html: "<p>Read this!</p>"
        };
        log = { info: s.stub() };
        fs = { writeFileSync: s.stub() };
        uuid = { v4: s.stub().returns("1234") };
        file = proxyquire(testSubject, { fs, uuid });

        sender = file({}, log);
    });

    it("writes two files to disk", (done) => {
        sender(mail, {}, (error) => {
            c.expect(error).to.be.not.ok;

            c.expect(fs.writeFileSync).to.have.been.calledWith("file-sender.1234.asbjoern@deranged.dk.This email is important.text", "Read this!");
            c.expect(fs.writeFileSync).to.have.been.calledWith("file-sender.1234.asbjoern@deranged.dk.This email is important.html", "<p>Read this!</p>");

            done();
        });
    });
});
