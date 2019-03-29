const s = require("sinon");
const c = require("chai").use(require("sinon-chai"));
const proxyquire = require("proxyquire");

const testSubject = "../lib/MailgunMustacheMailer";
describe("MailgunMustacheMailer", () => {
    let config, log, senderFunction, sender, MailgunMustacheMailer, mailgunMustacheMailer, template, recipient;

    beforeEach(() => {
        log = { info: s.stub() };
        config = { };
        senderFunction = s.spy((recipient, mailgunOptions, callback) => setImmediate(callback, null, "some-sent-id"));
        sender = s.stub().returns(senderFunction);

        template = {
            subject: "Hello {{name}}!",
            text: "Hello {{name}}!\n",
            html: "<p>Hello {{name}}!</p>"
        };
        recipient = {
            email: "asbjoern@deranged.dk",
            name: "Asbjørn Thegler"
        };

        MailgunMustacheMailer = proxyquire(testSubject, { "./senders/file": sender, "./senders/mailgun": sender });
        mailgunMustacheMailer = new MailgunMustacheMailer(config, log);
    });

    describe("#send", () => {
        it("returns an error, if email is missing", (done) => {
            delete recipient.email;
            mailgunMustacheMailer.send(template, recipient, (error) => {
                c.expect(error).to.be.ok;
                c.expect(error.message).to.eql("Recipient must have an email address");
                done();
            });
        });

        it("calls sender with rendered templates", (done) => {
            mailgunMustacheMailer.send(template, recipient, (error) => {
                c.expect(error).to.be.not.ok;
                c.expect(senderFunction).to.have.been.calledWith({
                    email: "asbjoern@deranged.dk",
                    name: "Asbjørn Thegler",
                    subject: "Hello Asbjørn Thegler!",
                    text: "Hello Asbjørn Thegler!\n",
                    html: "<p>Hello Asbjørn Thegler!</p>"
                });

                done();
            });
        });

        it("calls sender with rendered templates", (done) => {
            mailgunMustacheMailer.send(template, recipient, (error) => {
                c.expect(error).to.be.not.ok;
                c.expect(senderFunction).to.have.been.calledWith({
                    email: "asbjoern@deranged.dk",
                    name: "Asbjørn Thegler",
                    subject: "Hello Asbjørn Thegler!",
                    text: "Hello Asbjørn Thegler!\n",
                    html: "<p>Hello Asbjørn Thegler!</p>"
                });

                done();
            });
        });

        it("passes mailgun options through to the sender", (done) => {
            mailgunMustacheMailer.send(template, recipient, {
                someOption: true
            }, (error) => {
                c.expect(error).to.be.not.ok;
                c.expect(senderFunction).to.have.been.calledWith({
                    email: "asbjoern@deranged.dk",
                    name: "Asbjørn Thegler",
                    subject: "Hello Asbjørn Thegler!",
                    text: "Hello Asbjørn Thegler!\n",
                    html: "<p>Hello Asbjørn Thegler!</p>"
                }, { someOption: true });

                done();
            });
        });

        it("returns the id of the sent email", (done) => {
            mailgunMustacheMailer.send(template, recipient, (error, id) => {
                c.expect(error).to.be.not.ok;
                c.expect(id).to.equal("some-sent-id");

                done();
            });
        });
    });

    describe("#sendBatch", () => {
        let recipients;

        beforeEach(() => {
            recipients = [
                { email: "niels@deranged.dk", name: "Niels Abildgaard" },
                { email: "anders@deranged.dk", name: "Anders Enghøj" },
                { email: "asbjoern@deranged.dk", name: "Asbjørn Thegler" }
            ];
        });

        it("returns an error, if any one is missing", (done) => {
            delete recipients[0].email;
            mailgunMustacheMailer.sendBatch(template, recipients, (error) => {
                c.expect(error).to.be.ok;
                c.expect(error.message).to.eql("All recipients must have an email address");
                done();
            });
        });

        it("calls sender with rendered templates", (done) => {
            mailgunMustacheMailer.sendBatch(template, recipients, (error) => {
                c.expect(error).to.be.not.ok;

                c.expect(senderFunction).to.have.been.calledWith({
                    email: "asbjoern@deranged.dk",
                    name: "Asbjørn Thegler",
                    subject: "Hello Asbjørn Thegler!",
                    text: "Hello Asbjørn Thegler!\n",
                    html: "<p>Hello Asbjørn Thegler!</p>"
                });
                c.expect(senderFunction).to.have.been.calledWith({
                    email: "niels@deranged.dk",
                    name: "Niels Abildgaard",
                    subject: "Hello Niels Abildgaard!",
                    text: "Hello Niels Abildgaard!\n",
                    html: "<p>Hello Niels Abildgaard!</p>"
                });
                c.expect(senderFunction).to.have.been.calledWith({
                    email: "anders@deranged.dk",
                    name: "Anders Enghøj",
                    subject: "Hello Anders Enghøj!",
                    text: "Hello Anders Enghøj!\n",
                    html: "<p>Hello Anders Enghøj!</p>"
                });

                done();
            });
        });

        it("passes mailgun options through to the sender", (done) => {
            mailgunMustacheMailer.sendBatch(template, recipients, {
                someOption: true
            }, (error) => {
                c.expect(error).to.be.not.ok;

                c.expect(senderFunction).to.have.been.calledWith({
                    email: "asbjoern@deranged.dk",
                    name: "Asbjørn Thegler",
                    subject: "Hello Asbjørn Thegler!",
                    text: "Hello Asbjørn Thegler!\n",
                    html: "<p>Hello Asbjørn Thegler!</p>"
                }, { someOption: true });
                c.expect(senderFunction).to.have.been.calledWith({
                    email: "niels@deranged.dk",
                    name: "Niels Abildgaard",
                    subject: "Hello Niels Abildgaard!",
                    text: "Hello Niels Abildgaard!\n",
                    html: "<p>Hello Niels Abildgaard!</p>"
                }, { someOption: true });
                c.expect(senderFunction).to.have.been.calledWith({
                    email: "anders@deranged.dk",
                    name: "Anders Enghøj",
                    subject: "Hello Anders Enghøj!",
                    text: "Hello Anders Enghøj!\n",
                    html: "<p>Hello Anders Enghøj!</p>"
                }, { someOption: true });

                done();
            });
        });

        it("returns the sent id of all emails", (done) => {
            mailgunMustacheMailer.sendBatch(template, recipients, (error, ids) => {
                c.expect(error).to.be.not.ok;
                c.expect(ids).to.eql([
                    { mailId: "some-sent-id", email: "niels@deranged.dk" },
                    { mailId: "some-sent-id", email: "anders@deranged.dk" },
                    { mailId: "some-sent-id", email: "asbjoern@deranged.dk" }
                ]);
                done();
            });
        });

        it("returns any errors during sending", (done) => {
            let count = 0;
            const mailError = new Error();
            senderFunction.func = (recipient, mailgunOptions, callback) => {
                count++;
                if(count === 1) return setImmediate(callback, mailError);
                return setImmediate, callback(null, "some-sent-id");
            };

            mailgunMustacheMailer.sendBatch(template, recipients, (error, ids) => {
                c.expect(error).to.be.not.ok;
                c.expect(ids).to.eql([
                    { error: mailError, email: "niels@deranged.dk" },
                    { mailId: "some-sent-id", email: "anders@deranged.dk" },
                    { mailId: "some-sent-id", email: "asbjoern@deranged.dk" }
                ]);
                done();
            });
        });
    });
});
