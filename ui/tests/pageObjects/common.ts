import { expect } from "chai";
import { Key } from "selenium-webdriver";
import { toDatePicker, dateToTime } from "ui/utils/timeToDate";
import { matchPath } from "react-router";

export class PageUtils {
  private waitUntilTime = 10 * 1000;

  // programatically set timeout for locating functions
  public setLocatorTimeout = (num: number) => {
    this.waitUntilTime = num;
  }

  public buildUrl = (path?: string) => `${browser.config.baseUrl}${path ? path : ""}`;

  public getElementById = async (id: string, timeout: number = undefined) => {
    const waitTime = timeout || this.waitUntilTime;
    const element = await $(id);
    await element.waitForExist(waitTime);
    return element;
  }

  public getElementByCss = async (css: string, timeout: number = undefined) => {
    const waitTime = timeout || this.waitUntilTime;
    const element = await $(css);
    await element.waitForExist(waitTime);
    return element;
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
      await browser.waitUntil(() => {
        return browser.getUrl().then((url: string) => url !== currentUrl);
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
        await browser.waitUntil(async () => {
          const url = await browser.getUrl();
          return url === targetUrl;
        }, waitTime);
      } else {
        await browser.waitUntil(async () => {
          const url = await browser.getUrl();
          return url.indexOf(targetUrl) !== -1;
        }, waitTime);
      }
    } catch {
      throw new Error(`${targetUrl} never loaded`);
    }
  }

  public waitForPageToMatch = async (targetMatch: string, exact: boolean = false, timeout: number = undefined) => {
    const waitTime = timeout || this.waitUntilTime;
    try {
      await browser.waitUntil(() => {
        return browser.getUrl().then((url: string) => {
          const pathname = url.replace(browser.config.baseUrl, "");
          return !!matchPath(pathname, {
            exact,
            path: targetMatch,
          })
        });
      }, waitTime);
    } catch {
      throw new Error(`${targetMatch} never loaded`);
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
    return element.setValue(input);
  }
  public scrollToElement = async (elementLocator: string) => {
    try {
      const element = await this.getElementByCss(elementLocator);
      await element.scrollIntoView();
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
  public isElementDisplayed = (elementLocator: string, timeout: number = 1000) => {
    return this.getElementByCss(elementLocator, timeout).then(() => {
      return true;
    }).catch(() => {
      return false;
    });
  }
  public selectDropdownByValue = async (selectLocator: string, optionValue: any) => {
    // Find select and click to open option menu
    let select = await this.getElementByCss(selectLocator);
    // Material-UI hijacks the element and uses a div if using MenuItem with a Select component
    if ((await select.getTagName()) !== "select") {
        select = await this.getElementByCss(selectLocator);
    }

    await select.scrollIntoView();
    try {
      await select.click();
    } catch {
      await browser.execute("arguments[0].click()", select);
    }
    // Get all option elements
    let options = await select.$$("option");

    let optionValues;
    if (options && options.length) {
      // Async get value attr for each option
      optionValues = await Promise.all(options.map(async (option: any) => {
        return new Promise(async (resolve) => {
          const value = await option.getAttribute('value');
          resolve({ option, value });
        });
      }));
    } else {
      // Matieral UI library displays options in a list on top of the viewstack
      const menuSelectLocator = selectLocator.replace("#", "#menu-");
      const menuSelect = await this.getElementByCss(menuSelectLocator);
      options = await menuSelect.$$('li');

      if (!options || !options.length) {
        // This should throw an error since it wouldn't be in a select
        // but that's better than failing silently
        options = await menuSelect.$$('option');
      }

      // Async get value attr for each option
      optionValues = await Promise.all(options.map(async (option: any) => {
        return new Promise(async (resolve) => {
          const value = await option.getAttribute('data-value');
          resolve({ option, value });
        });
      }));
    }

    // Find matching one
    const matchingOptions = optionValues.filter((option: any) => {
      return option.value === optionValue;
    });

    // Select it
    const selectedOption = matchingOptions[0] as { option: WebdriverIOAsync.Element, value: string };
    await selectedOption.option.click();
    await browser.waitUntil(async () => {
      const isDisplayed = await selectedOption.option.isDisplayed();
      return isDisplayed;
    }, undefined, `Selected option with value ${selectedOption.value} never disappeared after selection`);
  }

  public selectCheckbox = async (element: WebdriverIOAsync.Element, check: boolean = true): Promise<void> => {
    const checked = await element.getAttribute("checked");
    if (!(checked && check)) {
      await element.click(); // Click it if its not checked and should be, or is checked and shouldn't be
    }
  }

  public assertInputError = async (elementLocator: string, exact: boolean = false, errorMsg?: string) => {
    const errorLocator = exact ? elementLocator : `${elementLocator}-error`;
    try {
      const errorText = await this.getElementText(errorLocator);
      if (errorMsg) {
        expect(errorText).to.eql(errorMsg);
      } else {
        expect(!!errorText).to.be.true;
      }
    } catch {
      throw new Error(`Unable to locate error element or element text using input locator ${elementLocator}-error`)
    }
  }
  public assertNoInputError = async (elementLocator: string, exact: boolean = false) => {
    const errorLocator = exact ? elementLocator : `${elementLocator}-error`;
    try {
      return this.isElementDisplayed(errorLocator).then(async (displayed) => {
        if (displayed) {
          return this.getElementText(errorLocator).then((text) => expect(!!text).to.be.false);
        }
        expect(!!displayed).to.be.false;
      });
    } catch {
      throw new Error(`Error for input locator ${errorLocator} displayed`);
    }
  }
  public assertElementHasText = async (elementLocator: string, text: string) => {
    try {
      const elementText = await this.getElementText(elementLocator);
      expect(elementText).to.eql(text);
    } catch {
      throw new Error(`Unable to locate element ${elementLocator} to assert text`);
    }
  }
  public waitForNotVisible = async (elementLocator: string, timeout?: number) => {
    try {
      await browser.waitUntil(() => {
        return this.isElementDisplayed(elementLocator).then((displayed) => !displayed);
      }, timeout || this.waitUntilTime);
      await browser.pause(200);
    } catch {
      throw new Error(`Error waiting for element to not be visible: ${elementLocator}`);
    }
  }

  public waitForText = async (elementLocator: string, text: string) => {
    try {
      await browser.waitUntil(() => {
        return this.getElementText(elementLocator).then((content) => {
          return (new RegExp(text)).test(content);
        });
      }, this.waitUntilTime);
      await browser.pause(200);
    } catch {
      throw new Error(`Error waiting for element ${elementLocator} to contain ${text}`);
    }
  }

  public waitForVisible = async (elementLocator: string) => {
    try {
      await browser.waitUntil(() => {
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

  public timeValue = (timeInMs: number) => {
    const date = toDatePicker(timeInMs);
    return dateToTime(date);
  }

  public fillSearchInput = async (elementLocator: string, searchVal: string, optionValue?: any) => {
    const element = await this.getElementByCss(`${elementLocator}`);
    try {
      await element.setValue(searchVal);
      return new Promise(resolve => {
        setTimeout(async () => {
          await browser.sendKeys([Key.ENTER]);
          resolve();
        }, 500);
      })
    } catch (e) {
      throw new Error(`Unable to enter keys: ${searchVal} in input: ${elementLocator}`);
    }
  }

  public fillAsyncSearchInput = async (elementLocator: string, searchVal: string, optionValue?: string) => {
    const input = await this.getElementByCss(`${elementLocator} input`);
    
    await input.setValue(searchVal);
    await browser.pause(1000);

    if (!optionValue) {
      await browser.keys(Key.ENTER);
    } else {
      const options = await $$(`[role="option"]`);
      let correctOpt;
      for (const opt of options) {
        const content = await opt.getText();
        if (content.indexOf(optionValue) !== -1) {
          correctOpt = opt;
          break;
        }
      }
      if (!correctOpt) {
        throw new Error(`Could not find option with label ${optionValue}`)
      }
      await correctOpt.click();
    }
  }

  public waitForEnabled = async (elementLocator: string) => {
    const element = await this.getElementByCss(elementLocator);
    await browser.waitUntil(async () => {
      const disabled = await element.getAttribute("disabled");
      return disabled !== "true";
    }, undefined, `Element ${elementLocator} never enabled`);
  }
}

export default new PageUtils();