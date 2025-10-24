import { WebDriver } from 'selenium-webdriver';
import { expect } from 'chai';
import { describe, it, before, after, beforeEach } from 'mocha';
import WebDriverHelper from '../config/webdriver';
import { LoginPage } from '../pages/LoginPage';
import { PetListPage } from '../pages/PetListPage';

describe('Pet Management E2E Tests', function() {
  let driver: WebDriver;
  let loginPage: LoginPage;
  let petListPage: PetListPage;

  this.timeout(60000);

  before(async function() {
    driver = await WebDriverHelper.buildDriver();
    loginPage = new LoginPage(driver);
    petListPage = new PetListPage(driver);

    // Fazer login antes de todos os testes
    await loginPage.open();
    const testEmail = process.env.TEST_USER_EMAIL || 'teste@utfpets.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'password123';
    await loginPage.login(testEmail, testPassword);
    await petListPage.waitForUrl('/pets', 10000);
  });

  after(async function() {
    await WebDriverHelper.quitDriver(driver);
  });

  beforeEach(async function() {
    // Navegar para lista de pets antes de cada teste
    await petListPage.open();
    await petListPage.waitForPetsToLoad();
  });

  describe('Pet List Page', function() {
    it('Deve carregar a página de pets corretamente', async function() {
      const title = await petListPage.getPageTitle();
      expect(title).to.equal('Meus Pets');

      await WebDriverHelper.takeScreenshot(driver, 'pets-lista-carregada.png');
    });

    it('Deve exibir estado vazio quando não há pets', async function() {
      // Este teste só passa se o usuário não tiver pets cadastrados
      const hasPets = await petListPage.hasPets();

      if (!hasPets) {
        const hasEmptyState = await petListPage.hasEmptyState();
        expect(hasEmptyState).to.be.true;

        await WebDriverHelper.takeScreenshot(driver, 'pets-estado-vazio.png');
      } else {
        console.log('⚠️ Usuário já possui pets - pulando teste de estado vazio');
        this.skip();
      }
    });

    it('Deve exibir lista de pets quando há pets cadastrados', async function() {
      const hasPets = await petListPage.hasPets();

      if (hasPets) {
        const petCount = await petListPage.getPetCount();
        expect(petCount).to.be.greaterThan(0);

        console.log(`✅ ${petCount} pet(s) encontrado(s)`);

        // Verificar dados do primeiro pet
        const firstPetName = await petListPage.getPetName(0);
        expect(firstPetName).to.be.a('string');
        expect(firstPetName.length).to.be.greaterThan(0);

        console.log(`🐾 Primeiro pet: ${firstPetName}`);

        await WebDriverHelper.takeScreenshot(driver, 'pets-lista-com-pets.png');
      } else {
        console.log('⚠️ Usuário não possui pets - pulando teste de lista');
        this.skip();
      }
    });

    it('Deve ter botão de adicionar pet visível', async function() {
      // Verificar que existe um botão primário (adicionar pet)
      const addButton = await driver.findElements({
        css: 'button[color="primary"]'
      });

      expect(addButton.length).to.be.greaterThan(0);
    });
  });

  describe('Pet Card Interactions', function() {
    it('Deve clicar em "Ver Detalhes" de um pet', async function() {
      const hasPets = await petListPage.hasPets();

      if (!hasPets) {
        console.log('⚠️ Sem pets para testar - pulando');
        this.skip();
        return;
      }

      const petName = await petListPage.getPetName(0);
      console.log(`Testando pet: ${petName}`);

      // Nota: Como o botão "Ver Detalhes" ainda não navega para lugar nenhum,
      // este teste apenas verifica se o botão existe e é clicável
      const petCard = await petListPage.getPetCardByIndex(0);
      const detailsButton = await petCard.findElement({
        css: 'button mat-icon'
      });

      const isDisplayed = await detailsButton.isDisplayed();
      expect(isDisplayed).to.be.true;

      await WebDriverHelper.takeScreenshot(driver, 'pets-card-detalhes.png');
    });
  });

  describe('Pet Navigation', function() {
    it('Deve permanecer na página de pets após interações', async function() {
      await petListPage.waitForPetsToLoad();

      const isOnPetList = await petListPage.isOnPetListPage();
      expect(isOnPetList).to.be.true;
    });
  });
});
