'use strict';

var http = require('http');

var MUMBLE_API = 'http://api.mumble.com/mumble/cvp.php?token=LSG-88-82243DEB';
var REPEAT_INTERVAL = 5 * 1000; //5 seconds

module.exports = function(robot) {
	var currentMumbleStatus = {}
	var lastLoggedInUsers =[]

	var getCurrentUsers = function(cb) {
		var url = MUMBLE_API + '&nocache=' + Date.now();
		http.get(url, function(res) {
			var body = '';

			res.on('data', function(chunk) {
				body += chunk;
			});

			res.on('end', function() {
				currentMumbleStatus = JSON.parse(body);
				cb(null, getUsersFromMumbleStatus());
			});
		}).on('error', function(e) {
			cb(e, null);
		});
	}

	var getUsersFromMumbleStatus = function() {
		var users = [];

		if(currentMumbleStatus.root) {
			addUsersFromChannelAndSubchannelsToArray(currentMumbleStatus.root, users);
		}

		return users;
	}

	var addUsersFromChannelAndSubchannelsToArray = function(channel, users) {
		if(channel.users) {
			channel.users.forEach(function(user) {
				users.push(user.name);
			})

			if(channel.channels) {
				channel.channels.forEach(function(subChannel) {
					addUsersFromChannelAndSubchannelsToArray(subChannel, users);
				});
			}
		}
	}

	var generateMumbleMessage = function(currentUsers, newUsers) {
		var message = '';
		var isMulti = newUsers.length > 1;

		newUsers.forEach(function(user, index) {
			if (index !== 0 ) {
				message += ', ';
			}

			message += '*' + user + '*';
		});

		if(isMulti) {
			message += ' have all'; 
		}

		message += ' just logged in on mumble!';

		if(currentUsers.length > 1) {
			message += '  Now there\'s *' + currentUsers.length + '* people on mumble.';
		} else {
			message += '  Now there\'s *1* lonely soul on mumble..';
		}

		message += '  Go play games with them!';

		if(currentMumbleStatus.x_connecturl) {
			message += '  If you have mumble installed click here ' +
				currentMumbleStatus.x_connecturl;
		}

		return message;
	}

	var reportOnMumbleStatus = function() {
		console.log('Checking for users..');
		getCurrentUsers(function(err, currentUsers) {

			if(err !== null) {
				setTimeout(reportOnMumbleStatus, REPEAT_INTERVAL);
				return;
			}

			var newUsers = currentUsers.filter(function(user) {
				var isUserNew = true;

				lastLoggedInUsers.forEach(function(oldUser) {
					if (user === oldUser) {
						isUserNew = false;
					}
				});

				return isUserNew;
			});

			if (newUsers.length === 0) {
				setTimeout(reportOnMumbleStatus, REPEAT_INTERVAL);
				return;
			} else {
				var message = generateMumbleMessage(currentUsers, newUsers);
				console.log('sending message...');
				robot.messageRoom('general', message);
			}

			lastLoggedInUsers = currentUsers;
			setTimeout(reportOnMumbleStatus, REPEAT_INTERVAL);
		});
	}
	reportOnMumbleStatus();
}
