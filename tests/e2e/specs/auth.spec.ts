import { WebDriver } from 'selenium-webdriver';
import { expect } from 'chai';
import { describe, it, before, after, beforeEach } from 'mocha';
import WebDriverHelper from '../config/webdriver';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { PetListPage } from '../pages/PetListPage';
import * as dotenv from 'dotenv';

dotenv.config();

describe('Authentication E2E Tests', function() {
  let driver: WebDriver;
  let loginPage: LoginPage;
  let registerPage: RegisterPage;
  let petListPage: PetListPage;

  this.timeout(60000);

  before(async function() {
    driver = await WebDriverHelper.buildDriver();
    loginPage = new LoginPage(driver);
    registerPage = new RegisterPage(driver);
    petListPage = new PetListPage(driver);
  });

  after(async function() {
    await WebDriverHelper.quitDriver(driver);
  });

  beforeEach(async function() {
    // Limpar cookies e storage antes de cada teste
    await WebDriverHelper.clearBrowserData(driver);
  });

  describe('Login', function() {
    it('Deve carregar a página de login corretamente', async function() {
      await loginPage.open();
      const title = await loginPage.getPageTitle();
      expect(title).to.exist;
      expect(title.length).to.be.greaterThan(0);
      await WebDriverHelper.takeScreenshot(driver, 'auth-login-page-loaded.png');
    });

    it('Botão de login deve estar desabilitado com campos vazios', async function() {
      await loginPage.open();
      await driver.sleep(1000); // Aguardar página renderizar
      const isDisabled = await loginPage.isLoginButtonDisabled();
      expect(isDisabled).to.be.true;
      await WebDriverHelper.takeScreenshot(driver, 'auth-login-button-disabled.png');
    });

    it('Deve aceitar entrada de email', async function() {
      await loginPage.open();
      await loginPage.enterEmail('teste@exemplo.com');
      // Não verificamos o botão aqui pois ainda falta a senha
      await WebDriverHelper.takeScreenshot(driver, 'auth-login-email-entered.png');
    });

    it('Deve aceitar entrada de senha', async function() {
      await loginPage.open();
      await loginPage.enterEmail('teste@exemplo.com');
      await loginPage.enterPassword('senha123');
      await WebDriverHelper.takeScreenshot(driver, 'auth-login-credentials-entered.png');
    });

    it('Deve mostrar erro com credenciais inválidas', async function() {
      await loginPage.open();
      await loginPage.login('invalido@teste.com', 'senhaerrada123');

      // Aguardar resposta do backend
      await driver.sleep(3000);

      // Verificar se há mensagem de erro ou modal de erro
      const hasError = await loginPage.hasErrorMessage();
      expect(hasError).to.be.true;

      await WebDriverHelper.takeScreenshot(driver, 'auth-login-invalid-credentials.png');
    });

    it('Deve fazer login com sucesso com credenciais válidas', async function() {
      await loginPage.open();

      const email = process.env.TEST_USER_EMAIL || 'teste@utfpets.com';
      const password = process.env.TEST_USER_PASSWORD || 'Test@12345';

      await loginPage.login(email, password);

      // Aguardar redirecionamento
      await loginPage.waitForUrl('/app/pets', 15000);

      const currentUrl = await loginPage.getCurrentUrl();
      expect(currentUrl).to.include('/app/pets');

      await WebDriverHelper.takeScreenshot(driver, 'auth-login-success.png');
    });

    it('Deve redirecionar rotas protegidas para login quando não autenticado', async function() {
      // Tentar acessar rota protegida sem estar logado
      await petListPage.open();

      // Deve redirecionar para login
      await driver.sleep(2000);
      const currentUrl = await petListPage.getCurrentUrl();
      expect(currentUrl).to.include('/auth/login');

      await WebDriverHelper.takeScreenshot(driver, 'auth-protected-route-redirect.png');
    });
  });

  describe('Register', function() {
    it('Deve carregar a página de registro corretamente', async function() {
      await registerPage.open();
      const title = await registerPage.getPageTitle();
      expect(title).to.exist;
      expect(title.length).to.be.greaterThan(0);
      await WebDriverHelper.takeScreenshot(driver, 'auth-register-page-loaded.png');
    });

    it('Botão de registro deve estar desabilitado com campos vazios', async function() {
      await registerPage.open();
      await driver.sleep(1000);
      const isDisabled = await registerPage.isRegisterButtonDisabled();
      expect(isDisabled).to.be.true;
      await WebDriverHelper.takeScreenshot(driver, 'auth-register-button-disabled.png');
    });

    it('Deve aceitar entrada de nome', async function() {
      await registerPage.open();
      await registerPage.enterName('Usuário Teste');
      await WebDriverHelper.takeScreenshot(driver, 'auth-register-name-entered.png');
    });

    it('Deve aceitar entrada de email', async function() {
      await registerPage.open();
      await registerPage.enterName('Usuário Teste');
      await registerPage.enterEmail('novousuario@teste.com');
      await WebDriverHelper.takeScreenshot(driver, 'auth-register-email-entered.png');
    });

    it('Deve validar formato de email', async function() {
      await registerPage.open();
      await registerPage.enterEmail('emailinvalido');
      await registerPage.enterPassword('Senha@123');
      await registerPage.enterPasswordConfirm('Senha@123');

      // Tentar submeter com email inválido
      const isDisabled = await registerPage.isRegisterButtonDisabled();
      // Botão deve estar desabilitado ou mostrar erro de validação
      expect(isDisabled).to.be.true;

      await WebDriverHelper.takeScreenshot(driver, 'auth-register-invalid-email.png');
    });

    it('Deve navegar para página de login através do link', async function() {
      await registerPage.open();
      await registerPage.clickLoginLink();

      await driver.sleep(1000);
      const currentUrl = await registerPage.getCurrentUrl();
      expect(currentUrl).to.include('/auth/login');

      await WebDriverHelper.takeScreenshot(driver, 'auth-register-to-login-nav.png');
    });
  });

  describe('Logout', function() {
    it('Deve fazer logout e redirecionar para login', async function() {
      // Primeiro fazer login
      await loginPage.open();
      const email = process.env.TEST_USER_EMAIL || 'teste@utfpets.com';
      const password = process.env.TEST_USER_PASSWORD || 'Test@12345';
      await loginPage.login(email, password);
      await loginPage.waitForUrl('/app/pets', 15000);

      // Fazer logout
      await petListPage.logout();

      // Aguardar redirecionamento
      await driver.sleep(2000);
      const currentUrl = await petListPage.getCurrentUrl();
      expect(currentUrl).to.include('/auth/login');

      await WebDriverHelper.takeScreenshot(driver, 'auth-logout-success.png');
    });

    it('Não deve permitir acesso a rotas protegidas após logout', async function() {
      // Fazer login
      await loginPage.open();
      const email = process.env.TEST_USER_EMAIL || 'teste@utfpets.com';
      const password = process.env.TEST_USER_PASSWORD || 'Test@12345';
      await loginPage.login(email, password);
      await loginPage.waitForUrl('/app/pets', 15000);

      // Fazer logout
      await petListPage.logout();
      await driver.sleep(2000);

      // Tentar acessar rota protegida
      await petListPage.open();
      await driver.sleep(2000);

      const currentUrl = await petListPage.getCurrentUrl();
      expect(currentUrl).to.include('/auth/login');

      await WebDriverHelper.takeScreenshot(driver, 'auth-post-logout-protected-route.png');
    });
  });

  describe('Session Persistence', function() {
    it('Deve manter sessão após recarregar página', async function() {
      // Fazer login
      await loginPage.open();
      const email = process.env.TEST_USER_EMAIL || 'teste@utfpets.com';
      const password = process.env.TEST_USER_PASSWORD || 'Test@12345';
      await loginPage.login(email, password);
      await loginPage.waitForUrl('/app/pets', 15000);

      // Recarregar página
      await driver.navigate().refresh();
      await driver.sleep(2000);

      // Deve continuar na página de pets
      const currentUrl = await petListPage.getCurrentUrl();
      expect(currentUrl).to.include('/app/pets');

      await WebDriverHelper.takeScreenshot(driver, 'auth-session-persistence.png');
    });
  });
});
