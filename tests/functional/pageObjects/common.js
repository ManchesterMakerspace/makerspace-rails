const waitUntilTime = 20000;

export function PageUtils() {
  this.getElementById = async (id, timeout = undefined) => {
    const waitTime = timeout || waitUntilTime;
    const el = await browser.wait(until.elementLocated(by.id(id)), waitTime)
    return await browser.wait(until.elementIsVisible(el), waitTime)
  }

  this.getElementByCss = async (css, timeout = undefined) => {
    const waitTime = timeout || waitUntilTime;
    const el = await browser.wait(until.elementLocated(by.css(css)), waitTime)
    return await browser.wait(until.elementIsVisible(el), waitTime)
  }

  /*
  * Wait for the page to change to something different. Inverse of waitForPageLoad
  */
  this.waitForPageChange = async (currentUrl, timeout = undefined) => {
    return await browser.wait(until.urlMatches(new RegExp(`(?!${currentUrl})`)), timeout || waitUntilTime);
  }

  /*
  * Wait for the page to equal a specific URL.  Inverse of waitForPageChange
  */
  this.waitForPageLoad = async (targetUrl, exact =false, timeout = undefined) => {
    const waitTime = timeout || waitUntilTime;
    if (exact) {
      return await browser.wait(until.urlIs(targetUrl), waitTime);
    } else {
      return await browser.wait(until.urlContains(targetUrl), waitTime);
    }
  }
  this.clickElement = async (elementLocator) => {
    const element = await this.getElementById(elementLocator);
    await element.click();
  }
  this.fillInput = async (elementLocator, input) => {
    const element = await this.getElementById(elementLocator);
    await element.sendKeys(input);
  }
  this.scrollToElement = async (elementLocator) => {
    const element = await this.getElementById(elementLocator);
    await browser.executeScript("arguments[0].scrollIntoView()", element)
  }
  this.getElementText = async (elementLocator) => {
    const element = await this.getElementById(elementLocator);
    return await element.getText();
  };
  this.getElementAttribute = async (elementLocator, attribute) => {
    const element = await this.getElementById(elementLocator);
    return await element.getAttribute(attribute);
  }
}