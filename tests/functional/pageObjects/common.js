export function PageUtils() {
  this.waitUntilTime = 10 * 1000;

  // programatically set timeout for locating functions
  this.setLocatorTimeout = (number) => {
    this.waitUntilTime = number;
  }

  this.getElementById = async (id, timeout = undefined) => {
    const waitTime = timeout || this.waitUntilTime;
    try {
      const el = await browser.wait(until.elementLocated(by.id(id)), waitTime);
      return await browser.wait(until.elementIsVisible(el), waitTime);
    } catch {
      throw new Error(`Unable to locate element id: ${id}`);
    }
  }

  this.getElementByCss = async (css, timeout = undefined) => {
    const waitTime = timeout || this.waitUntilTime;
    try {
      const el = await browser.wait(until.elementLocated(by.css(css)), waitTime)
      return await browser.wait(until.elementIsVisible(el), waitTime)
    } catch {
      throw new Error(`Unable to locate element css: ${css}`);
    }
  }

  /*
  * Wait for the page to change to something different. Inverse of waitForPageLoad
  */
  this.waitForPageChange = async (currentUrl, timeout = undefined) => {
    const waitTime = timeout || this.waitUntilTime;
    if (!currentUrl) {
      throw new Error("Current url required to watch for page change");
    }
    try {
      await browser.wait(() => {
        return browser.getCurrentUrl().then((url) => url !== currentUrl);
      }, waitTime);
    } catch {
      throw new Error(`Page never changed from ${currentUrl}`);
    }
  }

  /*
  * Wait for the page to equal a specific URL.  Inverse of waitForPageChange
  */
  this.waitForPageLoad = async (targetUrl, exact =false, timeout = undefined) => {
    const waitTime = timeout || this.waitUntilTime;
    try {
      if (exact) {
        await browser.wait(until.urlIs(targetUrl), waitTime);
      } else {
        await browser.wait(until.urlContains(targetUrl), waitTime);
      }
    } catch {
      throw new Error(`${targetUrl} never loaded`);
    }
  }

  this.clickElement = async (elementLocator) => {
    const element = await this.getElementByCss(elementLocator);
    try {
      await element.click();
    } catch {
      throw new Error(`Unable to click element: ${elementLocator}`);
    }
  }

  this.fillInput = async (elementLocator, input) => {
    const element = await this.getElementByCss(elementLocator);
    try {
      await element.sendKeys(input);
    } catch {
      throw new Error(`Unable to enter keys: ${input} in input: ${elementLocator}`);
    }
  }
  this.scrollToElement = async (elementLocator) => {
    const element = await this.getElementByCss(elementLocator);
    await browser.executeScript("arguments[0].scrollIntoView()", element)
  }
  this.getElementText = async (elementLocator) => {
    const element = await this.getElementByCss(elementLocator);
    try {
      return await element.getText();
    } catch {
      throw new Error(`Unable to read text from: ${elementLocator}`);
    }
  };
  this.getElementAttribute = async (elementLocator, attribute) => {
    const element = await this.getElementByCss(elementLocator);
    try {
      return await element.getAttribute(attribute);
    } catch {
      throw new Error(`Unable to read attribute: ${attribute} from: ${elementLocator}`);
    }
  }
}