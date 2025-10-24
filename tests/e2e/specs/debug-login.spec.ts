import { WebDriver, logging } from 'selenium-webdriver';
import { describe, it, before, after } from 'mocha';
import WebDriverHelper from '../config/webdriver';
import { LoginPage } from '../pages/LoginPage';

describe('Debug Login Navigation', function() {
  let driver: WebDriver;
  let loginPage: LoginPage;

  this.timeout(60000);

  before(async function() {
    driver = await WebDriverHelper.buildDriver();
    loginPage = new LoginPage(driver);
  });

  after(async function() {
    await WebDriverHelper.quitDriver(driver);
  });

  it('Deve fazer login e capturar erros do console', async function() {
    // Ir para página de login
    await loginPage.open();
    console.log('✓ Página de login aberta');

    // Fazer login
    const testEmail = process.env.TEST_USER_EMAIL || 'admin@utfpets.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'Admin@123';

    await loginPage.login(testEmail, testPassword);
    console.log('✓ Credenciais enviadas');

    // Aguardar 3 segundos
    await driver.sleep(3000);

    // Capturar logs do console
    const logs = await driver.manage().logs().get(logging.Type.BROWSER);

    console.log('\n========== CONSOLE LOGS ==========');
    logs.forEach(log => {
      const level = log.level.name;
      const message = log.message;
      console.log(`[${level}] ${message}`);
    });
    console.log('==================================\n');

    // Capturar URL atual
    const currentUrl = await driver.getCurrentUrl();
    console.log('URL atual:', currentUrl);

    // Tirar screenshot
    await WebDriverHelper.takeScreenshot(driver, 'debug-login-after-submit.png');
    console.log('✓ Screenshot salvo');

    // Aguardar mais 5 segundos para ver se algo acontece
    await driver.sleep(5000);

    // Capturar logs novamente
    const logsAfter = await driver.manage().logs().get(logging.Type.BROWSER);
    if (logsAfter.length > 0) {
      console.log('\n========== NOVOS LOGS ==========');
      logsAfter.forEach(log => {
        console.log(`[${log.level.name}] ${log.message}`);
      });
      console.log('================================\n');
    }

    // Verificar URL final
    const finalUrl = await driver.getCurrentUrl();
    console.log('URL final:', finalUrl);

    // Verificar localStorage
    const token = await driver.executeScript('return localStorage.getItem("access_token");');
    const user = await driver.executeScript('return localStorage.getItem("user");');

    console.log('Token no localStorage:', token ? 'SIM' : 'NÃO');
    console.log('User no localStorage:', user ? 'SIM' : 'NÃO');
  });
});
