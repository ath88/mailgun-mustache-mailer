var config = require("config");
var PgPool = require("pg-pool");

var EmailService = require("./lib/Service.js");

var pgPool = new PgPool(config.postgres);
var emailService = new EmailService(config.mail, pgPool);
emailService.start();
