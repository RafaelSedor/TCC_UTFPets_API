import { WebDriver, By, until, WebElement } from 'selenium-webdriver';

export abstract class BasePage {
  protected driver: WebDriver;
  protected baseUrl: string;

  constructor(driver: WebDriver) {
    this.driver = driver;
    this.baseUrl = process.env.BASE_URL || 'http://localhost:4201';
  }

  async navigateTo(path: string = ''): Promise<void> {
    await this.driver.get(`${this.baseUrl}${path}`);
  }

  async waitForElement(locator: By, timeout: number = 10000): Promise<WebElement> {
    return await this.driver.wait(until.elementLocated(locator), timeout);
  }

  async waitForElementVisible(locator: By, timeout: number = 10000): Promise<WebElement> {
    const element = await this.waitForElement(locator, timeout);
    await this.driver.wait(until.elementIsVisible(element), timeout);
    return element;
  }

  async click(locator: By): Promise<void> {
    const element = await this.waitForElementVisible(locator);
    await element.click();
  }

  async type(locator: By, text: string): Promise<void> {
    const element = await this.waitForElementVisible(locator);
    await element.clear();
    await element.sendKeys(text);
  }

  async getText(locator: By): Promise<string> {
    const element = await this.waitForElement(locator);
    return await element.getText();
  }

  async isElementPresent(locator: By): Promise<boolean> {
    try {
      await this.driver.findElement(locator);
      return true;
    } catch {
      return false;
    }
  }

  async waitForUrl(urlContains: string, timeout: number = 10000): Promise<void> {
    await this.driver.wait(until.urlContains(urlContains), timeout);
  }

  async getCurrentUrl(): Promise<string> {
    return await this.driver.getCurrentUrl();
  }
}
