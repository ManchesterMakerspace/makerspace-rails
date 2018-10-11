export const rootURL = `http://${process.env.APP_DOMAIN || 'localhost'}:${process.env.PORT || 3002}`;

export class PageUtils {
  private waitUntilTime = 10 * 1000;

  // programatically set timeout for locating functions
  public setLocatorTimeout = (number: number) => {
    this.waitUntilTime = number;
  }

  public buildUrl = (path: string) => `${rootURL}${path}`;

  public getElementById = async (id: string, timeout: number = undefined) => {
    const waitTime = timeout || this.waitUntilTime;
    try {
      const el = await browser.wait(until.elementLocated(by.id(id)), waitTime);
      return await browser.wait(until.elementIsVisible(el), waitTime);
    } catch {
      throw new Error(`Unable to locate element id: ${id}`);
    }
  }

  public getElementByCss = async (css: string, timeout: number = undefined) => {
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
  public waitForPageChange = async (currentUrl: string, timeout: number = undefined) => {
    const waitTime = timeout || this.waitUntilTime;
    if (!currentUrl) {
      throw new Error("Current url required to watch for page change");
    }
    try {
      await browser.wait(() => {
        return browser.getCurrentUrl().then((url: string) => url !== currentUrl);
      }, waitTime);
    } catch {
      throw new Error(`Page never changed from ${currentUrl}`);
    }
  }

  /*
  * Wait for the page to equal a specific URL.  Inverse of waitForPageChange
  */
  public waitForPageLoad = async (targetUrl: string, exact: boolean = false, timeout: number = undefined) => {
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

  public clickElement = async (elementLocator: string) => {
    const element = await this.getElementByCss(elementLocator);
    try {
      await element.click();
    } catch {
      throw new Error(`Unable to click element: ${elementLocator}`);
    }
  }

  public fillInput = async (elementLocator: string, input: string) => {
    const element = await this.getElementByCss(elementLocator);
    try {
      await element.sendKeys(input);
    } catch {
      throw new Error(`Unable to enter keys: ${input} in input: ${elementLocator}`);
    }
  }
  public scrollToElement = async (elementLocator: string) => {
    try {
      const element = await this.getElementByCss(elementLocator);
      await browser.executeScript("arguments[0].scrollIntoView()", element)
    } catch {
      throw new Error(`Unable to scroll to element ${elementLocator}`);
    }
  }
  public getElementText = async (elementLocator: string) => {
    const element = await this.getElementByCss(elementLocator);
    try {
      return await element.getText();
    } catch {
      throw new Error(`Unable to read text from: ${elementLocator}`);
    }
  };
  public getElementAttribute = async (elementLocator: string, attribute: string) => {
    const element = await this.getElementByCss(elementLocator);
    try {
      return await element.getAttribute(attribute);
    } catch {
      throw new Error(`Unable to read attribute: ${attribute} from: ${elementLocator}`);
    }
  }
  public isElementDisplayed = (elementLocator: string) => {
    return this.getElementByCss(elementLocator).then(() => {
      return true;
    }).catch(() => {
      return false;
    });
  }
  public assertInputError = async (elementLocator: string, errorMsg?: string) => {
    try {
      const errorInput = await this.getElementByCss(`${elementLocator}-error`);
      const errorText = await errorInput.getText();
      if (errorMsg) {
        expect(errorText).toEqual(errorMsg);
      } else {
        expect(errorText).toBeTruthy();
      }
    } catch {
      throw new Error(`Unable to locate error element or element text using input locator ${elementLocator}-error`)
    }
  }
  public assertNoInputError = async (elementLocator: string) => {
    const errorLocator = `${elementLocator}-error`;
    try {
      return this.isElementDisplayed(errorLocator).then((displayed) => {
        if (displayed) {
          return this.getElementText(errorLocator).then((text) => expect(text).toBeFalsy());
        }
        expect(displayed).toBeFalsy();
      });
    } catch {
      throw new Error(`Error for input locator ${errorLocator} displayed`);
    }
  }
  public assertElementHasText = async (elementLocator: string, text: string) => {
    try {
      const elementText = await this.getElementText(elementLocator);
      expect(elementText).toEqual(text);
    } catch {
      throw new Error(`Unable to locate element ${elementLocator} to assert text`);
    }
  }
}