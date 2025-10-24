import { By, WebDriver } from 'selenium-webdriver';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // Locators
  private emailInput = By.css('input[type="email"]');
  private passwordInput = By.css('input[type="password"]');
  private submitButton = By.css('button[type="submit"]');
  private registerLink = By.css('a[href*="register"]');
  private errorMessage = By.css('.error-message');
  private cardTitle = By.css('mat-card-title');

  constructor(driver: WebDriver) {
    super(driver);
  }

  async open(): Promise<void> {
    await this.navigateTo('/auth/login');
  }

  async enterEmail(email: string): Promise<void> {
    await this.type(this.emailInput, email);
  }

  async enterPassword(password: string): Promise<void> {
    await this.type(this.passwordInput, password);
  }

  async clickSubmit(): Promise<void> {
    await this.click(this.submitButton);
  }

  async login(email: string, password: string): Promise<void> {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickSubmit();
  }

  async getErrorMessage(): Promise<string> {
    return await this.getText(this.errorMessage);
  }

  async hasErrorMessage(): Promise<boolean> {
    return await this.isElementPresent(this.errorMessage);
  }

  async getPageTitle(): Promise<string> {
    return await this.getText(this.cardTitle);
  }

  async clickRegisterLink(): Promise<void> {
    await this.click(this.registerLink);
  }

  async isLoginButtonDisabled(): Promise<boolean> {
    const button = await this.driver.findElement(this.submitButton);
    const disabled = await button.getAttribute('disabled');
    return disabled === 'true';
  }
}
