import { By, WebDriver } from 'selenium-webdriver';
import { BasePage } from './BasePage';

export class PetListPage extends BasePage {
  // Locators
  private pageTitle = By.css('h1');
  private addPetButton = By.css('button.btn-primary, a[routerLink="/app/pets/new"]');
  private petCards = By.css('.group.bg-white.rounded-2xl');
  private emptyState = By.css('.card.text-center');
  private loadingIndicator = By.css('.animate-spin');

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
    const nameElement = await petCard.findElement(By.css('h3'));
    return await nameElement.getText();
  }

  async clickPetDetails(index: number): Promise<void> {
    const petCard = await this.getPetCardByIndex(index);
    await petCard.click(); // O card inteiro é clicável
  }

  async clickPetEdit(index: number): Promise<void> {
    const petCard = await this.getPetCardByIndex(index);
    const editButton = await petCard.findElement(By.xpath('.//button[contains(text(), "Editar")]'));
    await editButton.click();
  }

  async logout(): Promise<void> {
    const logoutButton = By.css('button[routerLink="/auth/login"]');
    await this.click(logoutButton);
  }

  async isOnPetListPage(): Promise<boolean> {
    const url = await this.getCurrentUrl();
    return url.includes('/pets');
  }

  async getPetSpecies(index: number): Promise<string> {
    const petCard = await this.getPetCardByIndex(index);
    const speciesBadge = await petCard.findElement(By.css('.absolute.top-3.right-3 span'));
    return await speciesBadge.getText();
  }

  async getPetBreed(index: number): Promise<string> {
    const petCard = await this.getPetCardByIndex(index);
    try {
      const breedElement = await petCard.findElement(By.css('p.text-sm.text-gray-600'));
      return await breedElement.getText();
    } catch {
      return '';
    }
  }

  async getPetWeight(index: number): Promise<string> {
    const petCard = await this.getPetCardByIndex(index);
    try {
      const weightElement = await petCard.findElement(By.xpath('.//span[contains(text(), "kg")]'));
      return await weightElement.getText();
    } catch {
      return '';
    }
  }
}
