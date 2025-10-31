import { Builder, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import * as fs from 'fs';
import * as path from 'path';

export default class WebDriverHelper {
  /**
   * Constrói e configura uma nova instância do WebDriver
   */
  static async buildDriver(): Promise<WebDriver> {
    const chromeOptions = new chrome.Options();

    // Configurações para execução headless (sem interface gráfica)
    chromeOptions.addArguments('--headless=new');
    chromeOptions.addArguments('--disable-gpu');
    chromeOptions.addArguments('--no-sandbox');
    chromeOptions.addArguments('--disable-dev-shm-usage');

    // Configurações de janela
    chromeOptions.addArguments('--window-size=1920,1080');
    chromeOptions.addArguments('--start-maximized');

    // Configurações de desempenho e segurança
    chromeOptions.addArguments('--disable-blink-features=AutomationControlled');
    chromeOptions.addArguments('--disable-extensions');
    chromeOptions.addArguments('--disable-popup-blocking');

    // Configurações de preferências
    chromeOptions.setUserPreferences({
      'profile.default_content_setting_values.notifications': 2,
      'credentials_enable_service': false,
      'profile.password_manager_enabled': false
    });

    // Construir o driver
    const driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();

    // Configurações adicionais
    await driver.manage().setTimeouts({
      implicit: 10000, // 10 segundos para encontrar elementos
      pageLoad: 30000, // 30 segundos para carregar página
      script: 30000    // 30 segundos para executar scripts
    });

    return driver;
  }

  /**
   * Encerra o driver de forma segura
   */
  static async quitDriver(driver: WebDriver): Promise<void> {
    if (driver) {
      try {
        await driver.quit();
      } catch (error) {
        console.error('Erro ao encerrar driver:', error);
      }
    }
  }

  /**
   * Tira um screenshot e salva na pasta screenshots
   */
  static async takeScreenshot(driver: WebDriver, filename: string): Promise<void> {
    try {
      const screenshotsDir = path.join(__dirname, '..', 'screenshots');

      // Criar diretório se não existir
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }

      const screenshot = await driver.takeScreenshot();
      const filepath = path.join(screenshotsDir, filename);

      fs.writeFileSync(filepath, screenshot, 'base64');
      console.log(`=ø Screenshot salvo: ${filename}`);
    } catch (error) {
      console.error('Erro ao tirar screenshot:', error);
    }
  }

  /**
   * Espera um tempo específico (use com moderação)
   */
  static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Executa uma ação com retry em caso de falha
   */
  static async retryAction<T>(
    action: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await action();
      } catch (error) {
        lastError = error as Error;
        console.log(`Tentativa ${i + 1}/${maxRetries} falhou. Tentando novamente...`);
        if (i < maxRetries - 1) {
          await this.sleep(delayMs);
        }
      }
    }

    throw lastError || new Error('Ação falhou após múltiplas tentativas');
  }

  /**
   * Scroll até um elemento específico
   */
  static async scrollToElement(driver: WebDriver, element: any): Promise<void> {
    await driver.executeScript('arguments[0].scrollIntoView({behavior: "smooth", block: "center"});', element);
    await this.sleep(500); // Aguardar animação de scroll
  }

  /**
   * Limpa todos os cookies e storage
   */
  static async clearBrowserData(driver: WebDriver): Promise<void> {
    await driver.manage().deleteAllCookies();
    await driver.executeScript('window.localStorage.clear();');
    await driver.executeScript('window.sessionStorage.clear();');
  }
}
