var HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');
var screenshotHelper = require('./spec/frontend/helpers/screenshot_helpers.js');
var mailHelper = require('./spec/frontend/helpers/mail_helpers.js');
var dbHelper = require('./spec/frontend/helpers/db_helpers.js');
var downloadHelper = require('./spec/frontend/helpers/download_helper.js');
var path = require('path');
var absoluteDownloadPath = path.resolve(__dirname, './spec/frontend/reporter/downloads');

var reporter = new HtmlScreenshotReporter({
  dest: 'spec/frontend/reporter',
  filename: 'integration-report.html',
  ignoreSkippedSpecs: true,
  reportOnlyFailedSpecs: false,
  captureOnlyFailedSpecs: true
});

var shuffle = function(array){
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
};

exports.config = {
    // The address of a running selenium server.
    seleniumAddress: 'http://localhost:4444/wd/hub',
    // seleniumAddress: 'http://selenium:4444/wd/hub',

    framework: 'jasmine',
    baseUrl: 'http://localhost:3002/#/',
    // baseUrl: 'http://interface:3002/#/',
    jasmineNodeOpts: {
            // If true, display spec names.
            isVerbose: true,
            // If true, print colors to the terminal.
            showColors: true,
            // If true, include stack traces in failures.
            includeStackTrace: false,
            // Default time to wait in ms before a test fails.
            defaultTimeoutInterval: 3000000
    },
    allScriptsTimeout: 300000,
    // Capabilities to be passed to the webdriver instance.
    capabilities: {
      'browserName': 'chrome',
      'chromeOptions': {
        'args': ['disable-infobars'],
        'prefs': {
            'download': {
                'prompt_for_download': false,
                'directory_upgrade': true,
                'default_directory': absoluteDownloadPath,
            }
        }
      }
    },


	// Spec patterns are relative to the location of the spec file. They may
	// include glob patterns, such as /**/*_spec.js
	suites: {
    login: 'spec/frontend/suites/login/integration_spec.js',
    members: 'spec/frontend/suites/members/integration_spec.js',
    rentals: 'spec/frontend/suites/rentals/integration_spec.js',
    renewMember: 'spec/frontend/suites/renewMember/integration_spec.js',
    newMember: 'spec/frontend/suites/newMember/integration_spec.js',
    memberEdit: 'spec/frontend/suites/memberEdit/integration_spec.js',
    rentalForm: 'spec/frontend/suites/rentalForm/integration_spec.js',
    selfRegister: 'spec/frontend/suites/selfRegister/integration_spec.js',
	},
	beforeLaunch: function() {
		return new Promise(function(resolve){
			reporter.beforeLaunch(resolve);
		}).then(function(){
       return dbHelper.resetDB();
    });
	},

	onPrepare: function() {
        screenshotHelper.cleanScreenshots();
        mailHelper.emptyMail();
        downloadHelper.emptyDownloads();
		    jasmine.getEnv().addReporter(reporter);
    		protractor.basePath = './spec/frontend/';
        protractor.dbHelper = dbHelper;
        protractor.screenshotHelper = screenshotHelper;
		    protractor.mailHelper = mailHelper;
        protractor.downloadHelper = downloadHelper;
        protractor.cssHelper = require('./spec/frontend/helpers/css_helpers.js');
        protractor.authHelper = require('./spec/frontend/helpers/auth_helpers.js');
        protractor.pageHelper = require('./spec/frontend/helpers/page_helpers.js');
        protractor.pageObjectHelper = require('./spec/frontend/helpers/page_object_helpers.js');
        protractor.coverageHelper = require('./spec/frontend/helpers/coverage_helpers.js');

        EditMemberPage = require('./spec/frontend/pages/edit_member_page.js');
        HeaderPage = require('./spec/frontend/pages/header_page.js');
        LoginPage = require('./spec/frontend/pages/login_page.js');
        MembersPage = require('./spec/frontend/pages/members_page.js');
        MembershipsPage = require('./spec/frontend/pages/memberships_page.js');
        NewMemberPage = require('./spec/frontend/pages/new_member_form_page.js');
        RenewMemberPage = require('./spec/frontend/pages/renew_member_form_page.js');
        RentalFormPage = require('./spec/frontend/pages/rental_form_page.js');
        RentalsPage = require('./spec/frontend/pages/rentals_page.js');
        ResetPasswordPage = require('./spec/frontend/pages/reset_password_page.js');
        RegisterPage = require("./spec/frontend/pages/register_page.js");
        InvitePage = require("./spec/frontend/pages/invite_page.js");
    },

	afterLaunch: function(exitCode) {
		return new Promise(function(resolve){
			reporter.afterLaunch(resolve.bind(this, exitCode));
		});
	}
};
