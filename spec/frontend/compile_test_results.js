#!/usr/bin/env node
var fs = require('fs');
var path = require('path');
var testResultPath = path.resolve(__dirname, 'test_results');
var resultFolders = fs.readdirSync(testResultPath);
var summary = testResultPath + "/results.html";
var cheerio = require('cheerio');
var phantom = require('phantom');

if( fs.existsSync(summary) ) {
  fs.unlinkSync(summary);
}

resultFolders.forEach(function (folder) {
  var folderName = path.resolve(testResultPath, folder);
  if(fs.existsSync(folderName) && fs.lstatSync(folderName).isFile()) {return;}
  var reportFile = path.resolve(folderName, 'integration-report.html');

  var _ph, _page;

  phantom.create().then(function(ph){
      _ph = ph;
      return _ph.createPage();
  }).then(function(page){
      _page = page;
      return _page.open(reportFile);
  }).then(function(){
      return _page.property('content');
  }).then(function(content){
      var $ = cheerio.load(content);
      var totalString = $('#summaryTotalSpecs').text();
      var total = totalString.split(" ").pop();
      var failString = $('#summaryTotalFailed').text();
      var fails = failString.split(" ").pop();
      var pass = total - fails;
      var statusClass = 'red';
      if(parseInt(fails) === 0) {
        statusClass = 'green';
      }
      var reportLink = (`<div><a style="color: ${statusClass}" href="${reportFile}">
          Suite: ${folder}; Failed: ${fails}; Passed: ${pass}; Total: ${total}
      </a></div>`);
      fs.appendFileSync(summary, reportLink);
      _page.close().then(function () {
        _ph.exit();
      })
  }).catch(function(e){
     console.log(e);
  });
});
