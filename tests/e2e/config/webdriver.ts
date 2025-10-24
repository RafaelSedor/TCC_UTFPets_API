import { Builder, WebDriver, Capabilities } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import { ServiceBuilder } from 'selenium-webdriver/chrome';
const chromedriver = require('chromedriver');

export class WebDriverHelper {
  static async buildDriver(): Promise<WebDriver> {
    const chromeOptions = new chrome.Options();

    // Check if headless mode is enabled (default: true)
    const headless = process.env.HEADLESS !== 'false';

    if (headless) {
      chromeOptions.addArguments('--headless=new');
    }

    // Essential Chrome arguments
    chromeOptions.addArguments('--disable-gpu');
    chromeOptions.addArguments('--no-sandbox');
    chromeOptions.addArguments('--disable-dev-shm-usage');
    chromeOptions.addArguments('--window-size=1920,1080');
    chromeOptions.addArguments('--disable-blink-features=AutomationControlled');
    chromeOptions.addArguments('--ignore-certificate-errors');

    // Disable automation flags
    chromeOptions.excludeSwitches('enable-automation');
    chromeOptions.addArguments('--disable-web-security');

    // Set Chrome binary location (Windows)
    chromeOptions.setChromeBinaryPath('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe');

    // Build ChromeDriver service with explicit path
    const serviceBuilder = new ServiceBuilder(chromedriver.path);

    const driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .setChromeService(serviceBuilder)
      .build();

    // Configure timeouts
    await driver.manage().setTimeouts({
      implicit: 10000,
      pageLoad: 30000,
      script: 30000
    });

    return driver;
  }

  static async quitDriver(driver: WebDriver): Promise<void> {
    if (driver) {
      await driver.quit();
    }
  }

  static async takeScreenshot(driver: WebDriver, filename: string): Promise<void> {
    const fs = require('fs');
    const path = require('path');

    const screenshot = await driver.takeScreenshot();
    const screenshotPath = path.join(__dirname, '../screenshots', filename);

    // Criar diretório se não existir
    const dir = path.dirname(screenshotPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(screenshotPath, screenshot, 'base64');
    console.log(`📸 Screenshot salvo: ${screenshotPath}`);
  }
}

export default WebDriverHelper;
