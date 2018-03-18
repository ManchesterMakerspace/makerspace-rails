var fs = require('fs');
var path = require('path');

var screenshotDir = "spec/frontend/reporter/screenshots/";

exports.cleanScreenshots = function(){
	if(!fs.existsSync(screenshotDir)){
		fs.mkdirSync(screenshotDir)
	} else {
		fs.readdir(screenshotDir, function(err, files){
			if (err) {throw err};

			files.forEach(function(file){
				fs.unlink(path.join(screenshotDir, file), function(err){
					if(err) {throw err};
				});
			});
		});
	}
};

exports.takeScreenshot = function(filename){
	browser.takeScreenshot().then(function(png){
			fs.writeFile(screenshotDir + filename + '.png', new Buffer(png, 'base64'), function(err){
				if(err) {throw err; }
			})
	});
};
