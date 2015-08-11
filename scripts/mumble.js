'use strict';

module.exports = function(robot) {
	var lastLoggedInUsers =[]

	var reportOnMumbleStatus = function() {
		var currentUsers = getCurrentUsers();
		var newUsers = currentUsers.filter(function(user) {
			lastLoggedInUsers.forEach(function(oldUser) {
			});
		});
	}
}
