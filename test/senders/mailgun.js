const s = require("sinon");
const c = require("chai").use(require("sinon-chai"));
const proxyquire = require("proxyquire");

const testSubject = "../../lib/senders/mailgun";
describe("file sender", () => {
    let request, sender, mailgun, mail, config, log;

    beforeEach(() => {
        mail = {
            email: "asbjoern@deranged.dk",
            name: "Asbjørn",
            subject: "This email is important",
            text: "Read this!",
            html: "<p>Read this!</p>"
        };
        config = {
            apiKey: "api-key",
            domain: "deranged.dk",
            from: "us@deranged.dk"
        };
        log = { info: s.stub() };
        request = { post: s.spy((options, callback) => callback(null, null, { id: "1234" })) };
        mailgun = proxyquire(testSubject, { request });

        sender = mailgun(config, log);
    });

    it("succeeds posting to mailgun", (done) => {
        sender(mail, { someOption: true }, (error) => {
            c.expect(error).to.be.not.ok;

            c.expect(request.post).to.have.been.calledWith({
                url: "https://api.mailgun.net/v3/deranged.dk/messages",
                auth: {
                    user: "api",
                    pass: "api-key"
                },
                formData: {
                    from: "us@deranged.dk",
                    to: "Asbjørn <asbjoern@deranged.dk>",
                    subject: "This email is important",
                    html: "<p>Read this!</p>",
                    text: "Read this!",
                    someOption: true
                }
            });

            done();
        });
    });

    it("returns an error if posting fails", (done) => {
        const mailgunError = new Error();
        request.post.func = (options, callback) => callback(mailgunError);

        sender(mail, {}, (error) => {
            c.expect(error).to.equal(mailgunError);

            done();
        });
    });
});
