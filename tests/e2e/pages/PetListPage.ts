import { By, WebDriver } from 'selenium-webdriver';
import { BasePage } from './BasePage';

export class PetListPage extends BasePage {
  // Locators
  private toolbar = By.css('mat-toolbar');
  private pageTitle = By.css('.header h1');
  private addPetButton = By.css('button[color="primary"]');
  private logoutButton = By.css('button mat-icon:contains("logout")');
  private petCards = By.css('.pet-card');
  private emptyState = By.css('.empty-state');
  private loadingIndicator = By.css('.loading');

  constructor(driver: WebDriver) {
    super(driver);
  }

  async open(): Promise<void> {
    await this.navigateTo('/app/pets');
  }

  async getPageTitle(): Promise<string> {
    return await this.getText(this.pageTitle);
  }

  async clickAddPet(): Promise<void> {
    await this.click(this.addPetButton);
  }

  async getPetCount(): Promise<number> {
    const pets = await this.driver.findElements(this.petCards);
    return pets.length;
  }

  async hasPets(): Promise<boolean> {
    const count = await this.getPetCount();
    return count > 0;
  }

  async hasEmptyState(): Promise<boolean> {
    return await this.isElementPresent(this.emptyState);
  }

  async isLoading(): Promise<boolean> {
    return await this.isElementPresent(this.loadingIndicator);
  }

  async waitForPetsToLoad(timeout: number = 10000): Promise<void> {
    await this.driver.sleep(1000); // Aguarda 1s para iniciar o loading

    // Aguarda o loading sumir
    const startTime = Date.now();
    while (await this.isLoading()) {
      if (Date.now() - startTime > timeout) {
        throw new Error('Timeout aguardando pets carregarem');
      }
      await this.driver.sleep(500);
    }
  }

  async getPetCardByIndex(index: number): Promise<any> {
    const petCards = await this.driver.findElements(this.petCards);
    if (index >= petCards.length) {
      throw new Error(`Pet index ${index} não encontrado. Total: ${petCards.length}`);
    }
    return petCards[index];
  }

  async getPetName(index: number): Promise<string> {
    const petCard = await this.getPetCardByIndex(index);
    const nameElement = await petCard.findElement(By.css('mat-card-title'));
    return await nameElement.getText();
  }

  async clickPetDetails(index: number): Promise<void> {
    const petCard = await this.getPetCardByIndex(index);
    const detailsButton = await petCard.findElement(By.css('button mat-icon:contains("visibility")'));
    await detailsButton.click();
  }

  async logout(): Promise<void> {
    // Clicar no botão do menu do usuário
    const menuButton = await this.driver.findElement(By.css('mat-toolbar button[mat-icon-button]'));
    await menuButton.click();

    // Aguardar menu abrir
    await this.driver.sleep(500);

    // Clicar no botão de sair
    const logoutBtn = await this.driver.findElement(By.css('button[mat-menu-item]'));
    await logoutBtn.click();
  }

  async isOnPetListPage(): Promise<boolean> {
    const url = await this.getCurrentUrl();
    return url.includes('/pets');
  }
}
