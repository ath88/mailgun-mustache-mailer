mailgun-mustache-mailer
=======================

This is a simple wrapper around mustache and mailgun.com's email API.

It is constructed by supplying the domain and API-key obtained from mailgun.com.

``` javascript
var MailgunMustacheMailer = require("mailgun-mustache-mailer");
var config = { domain: "example.com", apiKey: "secret-mailgun-key"};

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
    email: "asbjoern@thegler.dk",
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
    email: "asbjoern@thegler.dk",
    name: "Asbjørn Thegler"
}];

mailgunMustacheMailer.sendBatch(template, recipients, callback);
```

The callback from the batch job will be passed either an error or a list of objects zipping email addresses with mailId from mailgun.com.
