import { WebDriver, By, until, WebElement } from 'selenium-webdriver';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

export abstract class BasePage {
  protected driver: WebDriver;
  protected baseUrl: string;

  constructor(driver: WebDriver) {
    this.driver = driver;
    this.baseUrl = process.env.BASE_URL || 'http://localhost:4200';
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

  async waitForElementNotVisible(locator: By, timeout: number = 10000): Promise<void> {
    const element = await this.driver.findElement(locator);
    await this.driver.wait(until.elementIsNotVisible(element), timeout);
  }

  async clickWhenClickable(locator: By, timeout: number = 10000): Promise<void> {
    const element = await this.waitForElement(locator, timeout);
    await this.driver.wait(until.elementIsVisible(element), timeout);
    await this.driver.wait(until.elementIsEnabled(element), timeout);
    await element.click();
  }

  async isElementVisible(locator: By): Promise<boolean> {
    try {
      const element = await this.driver.findElement(locator);
      return await element.isDisplayed();
    } catch {
      return false;
    }
  }

  async waitForLoading(timeout: number = 10000): Promise<void> {
    // Aguarda loading spinners desaparecerem
    try {
      const loadingLocator = By.css('.animate-spin, .loading, .spinner');
      await this.waitForElementNotVisible(loadingLocator, timeout);
    } catch {
      // Se não encontrar loading, continua
    }
  }

  async scrollToTop(): Promise<void> {
    await this.driver.executeScript('window.scrollTo(0, 0);');
  }

  async getAttribute(locator: By, attribute: string): Promise<string | null> {
    const element = await this.waitForElement(locator);
    return await element.getAttribute(attribute);
  }

  async isEnabled(locator: By): Promise<boolean> {
    try {
      const element = await this.driver.findElement(locator);
      return await element.isEnabled();
    } catch {
      return false;
    }
  }

  async getElementCount(locator: By): Promise<number> {
    const elements = await this.driver.findElements(locator);
    return elements.length;
  }

  async selectDropdown(locator: By, value: string): Promise<void> {
    const select = await this.waitForElementVisible(locator);
    await select.findElement(By.css(`option[value="${value}"]`)).click();
  }
}
