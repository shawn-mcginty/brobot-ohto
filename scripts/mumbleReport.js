'use strict';

var log4js = require('log4js');

var mumbleUtils = require('../utils/mumble');
var log4jsConfig = require('../log4js.json');

log4js.configure(log4jsConfig);
var logger = log4js.getLogger('mumbleReport');
var REPEAT_INTERVAL = 5 * 1000; //5 seconds
var REPEAT_MESSAGE_THRESHOLD = 60 * 1000; //60 seconds

module.exports = function(robot) {
	var lastLoggedInUsers = []
	var lastMessage = {}

	var generateMumbleMessage = function(currentUsers, newUsers, cb) {
		var message = '';
		var isMulti = newUsers.length > 1;

		newUsers.forEach(function(user, index) {
			if (index !== 0) {
				message += ', ';
			}

			message += '*' + user + '*';
		});

		if (isMulti) {
			message += ' have all';
		}

		message += ' just logged in on mumble!';

		if (currentUsers.length > 1) {
			message += '  Now there\'s *' + currentUsers.length + '* people on mumble.';
		} else {
			message += '  Now there\'s *1* lonely soul on mumble..';
		}

		message += '  Go play games with them!';

		mumbleUtils.getCurrentStatus(function (err, currentMumbleStatus) {
			if (err) {
				cb(err, null);
				return;
			}

			if (currentMumbleStatus.x_connecturl) {
				message += '  If you have mumble installed click here ' +
				currentMumbleStatus.x_connecturl;
			}

			cb(null, message);
		});
	}

	var reportOnMumbleStatus = function() {
		mumbleUtils.getCurrentUsers(function(err, currentUsers) {

			if (err) {
				logger.error(err);
				setTimeout(reportOnMumbleStatus, REPEAT_INTERVAL);
				return;
			}

			logger.info('current users:');
			logger.info(currentUsers);

			var newUsers = currentUsers.filter(function(user) {
				var isUserNew = true;

				lastLoggedInUsers.forEach(function(oldUser) {
					if (user === oldUser) {
						isUserNew = false;
					}
				});

				return isUserNew;
			});

			lastLoggedInUsers = currentUsers;

			if (newUsers.length === 0) {
				logger.info('no new users');
				setTimeout(reportOnMumbleStatus, REPEAT_INTERVAL);
				return;
			} else {
				generateMumbleMessage(currentUsers, newUsers, function(err, message) {
					if (err) {
						logger.error(err);
						return;
					}

					if(justSentMessage(message)) {
						setTimeout(reportOnMumbleStatus, REPEAT_INTERVAL);
						return;
					}
					logger.info('message');
					logger.info(message);
					robot.messageRoom('general', message);
					logMessage(message);
				});
			}

			setTimeout(reportOnMumbleStatus, REPEAT_INTERVAL);
		});
	}

	var justSentMessage = function(message) {
		if (lastMessage.message !== message) {
			return false;
		}

		var timeSinceMessage = Date.now() - lastMessage.timestamp;
		
		return timeSinceMessage < REPEAT_MESSAGE_THRESHOLD;
	}

	var logMessage = function(message) {
		var messageLog = {}
		messageLog.message = message;
		messageLog.timestamp = Date.now();

		lastMessage = messageLog;
	}

	reportOnMumbleStatus();
}
