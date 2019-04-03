mailgun-mustache-mailer
=======================

This is a simple wrapper around mustache and mailgun.com's email API.

It is constructed by supplying the domain and API-key obtained from mailgun.com, as well as the email address that emails should appear to be sent from.

A second argument, `log` *may* is supplied, with a single method `info`, which is called when the mailer wants to log something.
It defaults to `{ info: console.log }`.

``` javascript
var MailgunMustacheMailer = require("mailgun-mustache-mailer");
var config = { domain: "example.com", apiKey: "secret-mailgun-key", from: "test@example.com" };

var mailgunMustacheMailer = new MailgunMustacheMailer(config);
```

After construction, the object can be used to send either single emails:

``` javascript
var template = {
    subject: "Hello {{name}}!",
    text: "Hello {{name}}!\n",
    html: "<p>Hello {{name}}!</p>"
};

var recipient = {
    email: "asbjoern@deranged.dk",
    name: "Asbjørn Thegler"
};

mailgunMustacheMailer.send(template, recipient, (error, mailId) => {
    if(error) return console.log(error);
    console.log("New mail was send with id %s", mailId);
});
```

.. or batch jobs:

``` javascript
var template = {
    subject: "Hello {{name}}!",
    text: "Hello {{name}}!\n",
    html: "<p>Hello {{name}}!</p>"
};

var recipients = [{
    email: "asbjoern@deranged.dk",
    name: "Asbjørn Thegler"
}];

mailgunMustacheMailer.sendBatch(template, recipients, callback);
```

The callback from the batch job will be passed either an error or a list of objects zipping email addresses with mailId from mailgun.com.
