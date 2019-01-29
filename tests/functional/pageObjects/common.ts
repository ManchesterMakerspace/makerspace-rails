import { Key } from "selenium-webdriver";
import { toDatePicker, dateToTime } from "ui/utils/timeToDate";
import * as moment from "moment";

export const rootURL = `http://${process.env.APP_DOMAIN || 'localhost'}:${process.env.PORT || 3002}`;

export class PageUtils {
  private waitUntilTime = 15 * 1000;

  // programatically set timeout for locating functions
  public setLocatorTimeout = (number: number) => {
    this.waitUntilTime = number;
  }

  public buildUrl = (path?: string) => `${rootURL}${path ? path : ""}`;

  public getElementById = async (id: string, timeout: number = undefined) => {
    const waitTime = timeout || this.waitUntilTime;
    let el;
    try {
      el = await browser.wait(until.elementLocated(by.id(id)), waitTime);
      return await browser.wait(until.elementIsVisible(el), waitTime);
    } catch {
      if (!el) {
        throw new Error(`Unable to locate element id: ${id}`);
      } else {
        return el;
      }
    }
  }

  public getElementByCss = async (css: string, timeout: number = undefined) => {
    const waitTime = timeout || this.waitUntilTime;
    let el;
    try {
      el = await browser.wait(until.elementLocated(by.css(css)), waitTime)
      return await browser.wait(until.elementIsVisible(el), waitTime)
    } catch {
      if (!el) {
        throw new Error(`Unable to locate element css: ${css}`);
      } else {
        return el;
      }
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
      if (!input) {
        return element.getAttribute("value").then((text: string) => Promise.all(text.split("").map(() => element.sendKeys(Key.BACK_SPACE))));
      } else {
        await element.clear();
        await element.sendKeys(input);
      }
    } catch (e) {
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
  public selectDropdownByValue = async (selectLocator: string, optionValue: any) => {
    // Find select and click to open option menu
    const select = await this.getElementByCss(selectLocator);
    await select.click();
    // Get all option elements
    const options = await select.findElements(by.css('option'));

    // Async get value attr for each option
    const optionValues = await Promise.all(options.map(async (option: any) => {
      return new Promise(async (resolve) => {
        const value = await option.getAttribute('value');
        resolve({ option, value });
      });
    }));

    // Find matching one
    const matchingOptions = optionValues.filter((option: any) => {
      return option.value === optionValue;
    });

    // Select it
    await (matchingOptions[0] as { option: any, value: string }).option.click();
  }
  public assertInputError = async (elementLocator: string, exact: boolean = false, errorMsg?: string) => {
    const errorLocator = exact ? elementLocator : `${elementLocator}-error`;
    try {
      const errorText = await this.getElementText(errorLocator);
      if (errorMsg) {
        expect(errorText).toEqual(errorMsg);
      } else {
        expect(errorText).toBeTruthy();
      }
    } catch {
      throw new Error(`Unable to locate error element or element text using input locator ${elementLocator}-error`)
    }
  }
  public assertNoInputError = async (elementLocator: string, exact: boolean = false) => {
    const errorLocator = exact ? elementLocator : `${elementLocator}-error`;
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
  public waitForNotVisible = async (elementLocator: string) => {
    try {
      await browser.wait(() => {
        return this.isElementDisplayed(elementLocator).then((displayed) => !displayed);
      }, this.waitUntilTime);
      await browser.sleep(200);
    } catch {
      throw new Error(`Error waiting for element to not be visible: ${elementLocator}`);
    }
  }

  public waitForVisisble = async (elementLocator: string) => {
    try {
      await browser.wait(() => {
        return this.isElementDisplayed(elementLocator).then((displayed) => displayed);
      }, this.waitUntilTime);
    } catch {
      throw new Error(`Error waiting for element to be visible: ${elementLocator}`);
    }
  }

  public inputTime = async (elementLocator: string, timeInMs: number) => {
    try {
      const date = toDatePicker(timeInMs);
      const [year, month, day] = date.split("-");
      const dateString = `${month}${day}${year}`;
      await this.fillInput(elementLocator, dateString);
    } catch {
      throw new Error(`Error writing time: ${timeInMs} for element: ${elementLocator}`);
    }
  }
}

export default new PageUtils();