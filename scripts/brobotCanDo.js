'use strict';

var fs = require('fs');

module.exports = function(robot) {
	var WHAT_I_CAN_DO = '*HELP!* I\'m broken! :finnadie:';

	robot.hear(/what can (\@brobot|bro bot|brobot) do\?/i, function(res) {
		listWhatBrobotCanDo(res);
	});

	robot.respond(/what can you do\?/i, function(res) {
		listWhatBrobotCanDo(res);
	});

	robot.respond(/help/i, function(res) {
		listWhatBrobotCanDo(res);
	});

	var listWhatBrobotCanDo = function(res) {
		res.send(WHAT_I_CAN_DO);
	}

	var loadDocs = function() {
		fs.readFile(__dirname + '/../doc/cmdList.md', 'utf8', function(err, data) {
			if (err) {
				console.error(err);
				return;
			}

			var lines = data.split('\n');
			var goodLines = removeComments(lines);
			WHAT_I_CAN_DO = goodLines.join('\n');
		});
	}

	var removeComments = function(lines) {
		return lines.filter(function(line) {
			return line.charAt(0) != '#';
		});
	}

	loadDocs();
}