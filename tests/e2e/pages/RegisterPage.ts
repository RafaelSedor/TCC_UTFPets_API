import { By, WebDriver } from 'selenium-webdriver';
import { BasePage } from './BasePage';

export class RegisterPage extends BasePage {
  // Locators
  private nameInput = By.css('input[formControlName="name"]');
  private emailInput = By.css('input[formControlName="email"]');
  private passwordInput = By.css('input[formControlName="password"]');
  private passwordConfirmInput = By.css('input[formControlName="password_confirmation"]');
  private submitButton = By.css('button[type="submit"]');
  private loginLink = By.css('a[href*="login"]');
  private errorMessage = By.css('.error-message, .text-red-600');
  private successMessage = By.css('.success-message, .text-green-600');

  constructor(driver: WebDriver) {
    super(driver);
  }

  async open(): Promise<void> {
    await this.navigateTo('/auth/register');
  }

  async enterName(name: string): Promise<void> {
    await this.type(this.nameInput, name);
  }

  async enterEmail(email: string): Promise<void> {
    await this.type(this.emailInput, email);
  }

  async enterPassword(password: string): Promise<void> {
    await this.type(this.passwordInput, password);
  }

  async enterPasswordConfirm(password: string): Promise<void> {
    await this.type(this.passwordConfirmInput, password);
  }

  async clickSubmit(): Promise<void> {
    await this.clickWhenClickable(this.submitButton);
  }

  async register(name: string, email: string, password: string): Promise<void> {
    await this.enterName(name);
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.enterPasswordConfirm(password);
    await this.clickSubmit();
  }

  async getErrorMessage(): Promise<string> {
    return await this.getText(this.errorMessage);
  }

  async hasErrorMessage(): Promise<boolean> {
    return await this.isElementPresent(this.errorMessage);
  }

  async clickLoginLink(): Promise<void> {
    await this.click(this.loginLink);
  }

  async isRegisterButtonDisabled(): Promise<boolean> {
    return !(await this.isEnabled(this.submitButton));
  }

  async getPageTitle(): Promise<string> {
    const title = By.css('h1, h2');
    return await this.getText(title);
  }
}
