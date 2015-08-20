'use strict';

var mumbleUtils = require('../utils/mumble');

module.exports = function(robot) {
	robot.hear(/who's on mumble\?/i, function(res) {
		reportWhoIsOnMumble(res);
	});

	robot.hear(/\b(is|are)\b.*on mumble\?/i, function(res) {
		reportWhoIsOnMumble(res);
	});

	var reportWhoIsOnMumble = function(res) {
		mumbleUtils.getCurrentUsers(function(err, users) {
			var message = '';

			if (users.length === 0) {
				message = 'Nobody is on mumble :broken_heart:';
			} else if (users.length === 1) {
				message = 'Just *' + users[0] + '*... what a loner :poop:'
			} else {
				message = '*' + users.join('*, *') + '* are all currently on mumble :godmode:';
			}

			res.send(message);
		});
	}

	robot.hear(/the mumble info\?/i, function(res) {
		mumbleUtils.getCurrentStatus(function(err, status) {
			var message;
			if (status.x_connecturl) {
				message = 'Using the password _havefun_ you can connect to mumble at ' + status.x_connecturl;
			} else {
				message = 'Hmm.. I can\'t reach mumble at the moment. Maybe it\'s down..';
			}

			res.send(message);
		});
	});
}