import { WebDriver } from 'selenium-webdriver';
import { expect } from 'chai';
import { describe, it, before, after } from 'mocha';
import WebDriverHelper from '../config/webdriver';
import { LoginPage } from '../pages/LoginPage';
import { PetListPage } from '../pages/PetListPage';

describe('Authentication E2E Tests', function() {
  let driver: WebDriver;
  let loginPage: LoginPage;
  let petListPage: PetListPage;

  // Configurar timeout para testes E2E
  this.timeout(60000);

  before(async function() {
    driver = await WebDriverHelper.buildDriver();
    loginPage = new LoginPage(driver);
    petListPage = new PetListPage(driver);
  });

  after(async function() {
    await WebDriverHelper.quitDriver(driver);
  });

  describe('Login Page', function() {
    it('Deve carregar a página de login corretamente', async function() {
      await loginPage.open();
      const title = await loginPage.getPageTitle();
      expect(title).to.equal('UTFPets');
    });

    it('Deve desabilitar botão de login quando campos estão vazios', async function() {
      await loginPage.open();
      const isDisabled = await loginPage.isLoginButtonDisabled();
      expect(isDisabled).to.be.true;
    });

    it('Deve mostrar erro ao tentar login com credenciais inválidas', async function() {
      await loginPage.open();
      await loginPage.login('usuario_invalido@teste.com', 'senha_errada');

      // Aguardar resposta da API
      await driver.sleep(2000);

      const hasError = await loginPage.hasErrorMessage();
      expect(hasError).to.be.true;

      // Tirar screenshot do erro
      await WebDriverHelper.takeScreenshot(driver, 'login-erro-credenciais-invalidas.png');
    });

    it('Deve redirecionar para /pets após login bem-sucedido', async function() {
      // NOTA: Este teste requer um usuário válido no backend
      // Você pode criar um usuário de teste ou usar seed do banco

      await loginPage.open();

      // Credenciais de teste - AJUSTE conforme seu ambiente
      const testEmail = process.env.TEST_USER_EMAIL || 'admin@utfpets.com';
      const testPassword = process.env.TEST_USER_PASSWORD || 'Admin@123';

      await loginPage.login(testEmail, testPassword);

      // Aguardar redirecionamento
      await petListPage.waitForUrl('/app/pets', 10000);

      const isOnPetList = await petListPage.isOnPetListPage();
      expect(isOnPetList).to.be.true;

      // Tirar screenshot do sucesso
      await WebDriverHelper.takeScreenshot(driver, 'login-sucesso.png');
    });
  });

  describe('Protected Routes', function() {
    it('Deve redirecionar para login ao acessar /pets sem autenticação', async function() {
      // Limpar cookies/storage para simular não autenticado
      await driver.manage().deleteAllCookies();
      await driver.executeScript('localStorage.clear();');

      await petListPage.open();

      // Deve redirecionar para login
      await loginPage.waitForUrl('/auth/login', 5000);

      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).to.include('/auth/login');
    });
  });

  describe('Logout', function() {
    it('Deve fazer logout e redirecionar para login', async function() {
      // Primeiro fazer login
      await loginPage.open();
      const testEmail = process.env.TEST_USER_EMAIL || 'admin@utfpets.com';
      const testPassword = process.env.TEST_USER_PASSWORD || 'Admin@123';
      await loginPage.login(testEmail, testPassword);
      await petListPage.waitForUrl('/app/pets', 10000);

      // Fazer logout
      await petListPage.logout();

      // Aguardar redirecionamento para login
      await loginPage.waitForUrl('/auth/login', 5000);

      const currentUrl = await driver.getCurrentUrl();
      expect(currentUrl).to.include('/auth/login');

      // Tirar screenshot
      await WebDriverHelper.takeScreenshot(driver, 'logout-sucesso.png');
    });
  });
});
