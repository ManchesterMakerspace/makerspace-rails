const waitUntilTime = 20000;
global.getElementById = async (id, timeout=null) => {
  const waitTime = timeout || waitUntilTime;
  const el = await browser.wait(until.elementLocated(by.id(id)), waitTime)
  return await browser.wait(until.elementIsVisible(el), waitTime)
}

global.getElementByCss = async (css, timeout=null) => {
  const waitTime = timeout || waitUntilTime;
  const el = await browser.wait(until.elementLocated(by.css(css)), waitTime)
  return await browser.wait(until.elementIsVisible(el), waitTime)
}

/*
* Wait for the page to change to something different. Inverse of waitForPageLoad
*/
global.waitForPageChange = async (currentUrl, timeout=null) => {
  return await browser.wait(until.urlMatches(new RegExp(`(?!${currentUrl})`)), timeout || waitUntilTime);
}

/*
* Wait for the page to equal a specific URL.  Inverse of waitForPageChange
*/
global.waitForPageLoad = async (targetUrl, exact=false, timeout=null) => {
  const waitTime = timeout || waitUntilTime;
  if (exact) {
    return await browser.wait(until.urlIs(targetUrl), waitTime);
  } else {
    return await browser.wait(until.urlContains(targetUrl), waitTime);
  }
}