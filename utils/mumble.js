'use strict';

var http = require('http');

var Cache = require('node-cache');

var CURRENT_STATUS = 'status';

module.exports = (function() {
	var mumbleUtils = {}
	var cachedData = new Cache({stdTTL: 2, checkperiod: 4});

	mumbleUtils.MUMBLE_API = 'http://api.mumble.com/mumble/cvp.php?token=LSG-88-82243DEB';

	var setCurrentStatus = function(status) {
		cachedData.set(CURRENT_STATUS, status);
	}

	mumbleUtils.getCurrentStatus = function(cb) {
		var currentStatus = cachedData.get(CURRENT_STATUS);
		if (currentStatus === undefined) {
			populateCurrentMumbleStatus(function(err, status) {
				if(err) {
					cb(err, null);
					return;
				}

				cachedData.set(CURRENT_STATUS, status);
				cb(null, status);
			});
		} else {
			cb(null, currentStatus);
		}
	}

	var populateCurrentMumbleStatus = function(cb) {
		var url = mumbleUtils.MUMBLE_API + '&nocache=' + Date.now();
		http.get(url, function(res) {
			var body = '';

			res.on('data', function(chunk) {
				body += chunk;
			});

			res.on('end', function() {
				var currentMumbleStatus = JSON.parse(body);
				cb(null, currentMumbleStatus);
			});
		}).on('error', function(e) {
			cb(e, null);
			return;
		});
	}

	mumbleUtils.getCurrentUsers = function(cb) {
		mumbleUtils.getCurrentStatus(function(err, status) {
			if (err) {
				cb(err, null);
				return;
			}

			cb(null, getUsersFromMumbleStatus(status));
		});
	}

	var getUsersFromMumbleStatus = function(currentMumbleStatus) {
		var users = [];

		if (currentMumbleStatus.root) {
			addUsersFromChannelAndSubchannelsToArray(currentMumbleStatus.root, users);
		}

		return users;
	}

	var addUsersFromChannelAndSubchannelsToArray = function(channel, users) {
		if (channel.users) {
			channel.users.forEach(function(user) {
				users.push(user.name);
			})

			if (channel.channels) {
				channel.channels.forEach(function(subChannel) {
					addUsersFromChannelAndSubchannelsToArray(subChannel, users);
				});
			}
		}
	}

	mumbleUtils.getUsername = function(response) {
		return '@' + response.message.user.name;
	}

	mumbleUtils.getChannel = function(response) {
		if (response.message.room == response.message.user.name) {
			return '@' + response.message.room;
		} else {
			return '#' + response.message.room;
		}
	}

	return mumbleUtils;
})();