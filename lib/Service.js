var fs = require("fs");
var _ = require("lodash");
var async = require("async");
var CronJob = require("cron").CronJob;
var uuid = require("uuid");

var mustache = require("mustache");

var fileSender = require("./senders/file.js");
var mailgunSender = require("./senders/mailgun.js");

var jobsPath = "jobs";

var EmailService = module.exports = function(config, pgPool) {
    this.config = config;
    this.log = console;
    this.pgPool = pgPool;

    this.sender = config.dryrun ? fileSender : mailgunSender(config.mailgun);

    this.jobs = [];
};

EmailService.prototype.start = function(callback = _.noop) {
    this.log.info("Started etree Email Service - looking for scheduled emails");

    _.each(this.config.jobs, (job) => {
        // var staticDate = new Date("2016-10-01T13:56:00");

        var now = new Date();
        now.setSeconds(now.getSeconds() + 3);

        job.when = now;
        try {
            this.jobs.push(new CronJob({
                cronTime: job.when,
                onTick: () => this.buildJob(job),
                start: true
            }));
        }
        catch(ex) {
            this.log.error("Cron pattern is not valid [%s]", job.when);
        }
    });

    var oldJobs = fs.readdirSync(jobsPath);
    _.each(oldJobs, (oldJobId) => {
        if(oldJobId === ".gitignore") {
            return;
        }

        var jobPath = jobsPath + "/" + oldJobId;
        var job = JSON.parse(fs.readFileSync(jobPath + "/job.json").toString());

        if(job.emailsSent) {
            return;
        }

        if(job.emailContentGenerated) {
            this.log.info("Found job ready for sending: [%s]", oldJobId);
            return this.startSending(oldJobId);
        }

        if(job.buildRecipientList) {
            this.log.info("Found job ready for content generation: [%s]", oldJobId);
            return this.generateEmailContent(oldJobId);
        }

        this.log.info("Found job ready for building of recipient list: [%s]", oldJobId);
        this.buildRecipientList(oldJobId);
    });

    callback();
};

EmailService.prototype.buildJob = function(job) {
    var jobId = uuid.v4();
    this.log.info("Building job [%s]", jobId);

    var jobPath = jobsPath + "/" + jobId;
    fs.mkdirSync(jobPath);

    fs.writeFileSync(jobPath + "/" + "job.json", JSON.stringify(job, null, 4));
    this.buildRecipientList(jobId);
};

EmailService.prototype.buildRecipientList = function(jobId) {
    this.log.info("Building recipient list for job [%s]", jobId);
    var jobPath = jobsPath + "/" + jobId;
    var job = JSON.parse(fs.readFileSync(jobPath + "/job.json").toString());

    var recipientsPath = jobPath + "/recipients";
    try {
        fs.mkdirSync(recipientsPath);
    }
    catch(error) {
        // ignore
    }

    var recipients = { };
    if(this.config.demoRecipient) {
        var recipientId = uuid.v4();
        recipients[recipientId] = this.config.demoRecipient;
    }
    else {
        // get recepients from pgPool
        // generate uuids for all of them
    }

    job.recipients = [];
    _.each(recipients, (recipient, recipientId) => {
        fs.writeFileSync(recipientsPath + "/" + recipientId, JSON.stringify(recipient, null, 4));
        job.recipients.push(recipientId);
    });

    job.recipientListCreated = true;
    fs.writeFileSync(jobPath + "/" + "job.json", JSON.stringify(job, null, 4));
    this.generateEmailContent(jobId);
};

EmailService.prototype.generateEmailContent = function(jobId) {
    this.log.info("Building email content from template for job [%s]", jobId);
    var jobPath = jobsPath + "/" + jobId;
    var job = JSON.parse(fs.readFileSync(jobPath + "/job.json"));

    var recipientsPath = jobPath + "/recipients";

    var subjectTemplate = fs.readFileSync("templates/" + job.template + ".subject.mustache").toString();
    var htmlTemplate = fs.readFileSync("templates/" + job.template + ".html.mustache").toString();
    var textTemplate = fs.readFileSync("templates/" + job.template + ".text.mustache").toString();

    _.each(job.recipients, (recipientId) => {
        var recipient = JSON.parse(fs.readFileSync(recipientsPath + "/" + recipientId));
        recipient.subject = mustache.render(subjectTemplate, recipient);
        recipient.html = mustache.render(htmlTemplate, recipient);
        recipient.text = mustache.render(textTemplate, recipient);
        fs.writeFileSync(recipientsPath + "/" + recipientId, JSON.stringify(recipient, null, 4));
    });

    job.emailContentGenerated = true;
    fs.writeFileSync(jobPath + "/" + "job.json", JSON.stringify(job, null, 4));
    this.startSending(jobId);
};

EmailService.prototype.startSending = function(jobId) {
    this.log.info("Sending emails for job [%s]", jobId);
    var jobPath = jobsPath + "/" + jobId;
    var job = JSON.parse(fs.readFileSync(jobPath + "/job.json"));

    var recipientsPath = jobPath + "/recipients";

    async.each(job.recipients, (recipientId, callback) => {
        var recipient = JSON.parse(fs.readFileSync(recipientsPath + "/" + recipientId));
        if(recipient.sent) {
            return callback();
        }

        this.sender(recipient, (error, sentId) => {
            if(error) {
                this.log.error("Could not send: " + recipient);
                callback();
            }

            recipient.sentId = sentId;
            recipient.sent = true;
            fs.writeFileSync(recipientsPath + "/" + recipientId, JSON.stringify(recipient, null, 4));
            callback();
        });
    }, () => {
        job.emailsSent = true;
        fs.writeFileSync(jobPath + "/" + "job.json", JSON.stringify(job, null, 4));
    });
};
