const { Builder, By, Key, until } = require('selenium-webdriver')
require('selenium-webdriver/chrome')
require('selenium-webdriver/firefox')
require('chromedriver')
const mockServerClient = require('mockserver-client').mockServerClient;

const rootURL = 'http://www.localhost:3002/'
const waitUntilTime = 20000
let driver;
jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000 * 60 * 5

async function getElementById(id) {
  const el = await driver.wait(until.elementLocated(By.id(id)), waitUntilTime)
  return await driver.wait(until.elementIsVisible(el), waitUntilTime)
}

async function getElementByCss(css) {
  const el = await driver.wait(until.elementLocated(By.css(css)), waitUntilTime)
  return await driver.wait(until.elementIsVisible(el), waitUntilTime)
}

beforeAll(() => {
  return new Builder().forBrowser('chrome').build().then((d) => {
    driver = d 
  });
})
afterAll(() => {
  driver && driver.quit && driver.quit()
})

it('initialises the context', async () => {
  await driver.manage().window().setPosition(0, 0)
  await driver.manage().window().setSize(1280, 1024)
  await driver.get(rootURL)
})

xit('should load the landing page', async () => {
  const el = await getElementByCss('[id="landing-page-graphic"]');
  expect(await el.getText()).toEqual("Manchester Makerspace");
})

let mockserver;
describe("API Mocking", () => {
  beforeEach(() => {
    mockserver = mockServerClient("localhost", 1080)
  });

  it("Mocks sign in request", async () => {
    
    await mockserver.mockAnyResponse({
        "httpRequest": {
          "method": "POST",
          "path": "/api/members/sign_in.json",
        },
        "httpResponse": {
          "body": JSON.stringify({
            member: {
              id: "test_member",
              firstname: "Test",
              lastname: "Member",
              email: "test_member@test.com",
              role: ["member"]
            }
          })
        }
      })
    await mockserver.mockAnyResponse({
      "httpRequest": {
        "method": "GET",
        "path": "/api/members/test_member.json",
      },
      "httpResponse": {
        "body": JSON.stringify({
          member: {
            id: "test_member",
            firstname: "Test",
            lastname: "Member",
            email: "test_member@test.com",
            role: ["member"]
          }
        })
      }
    })
    await driver.get(rootURL);
    const el = await getElementByCss('[id="landing-page-graphic"]');
    await driver.wait(() => false)
  });
})