const ScreenshotReporter = require('../reporters/screenshotReporter');
jasmine.getEnv().addReporter(new ScreenshotReporter({ browser }));