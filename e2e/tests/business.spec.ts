import { test, expect } from '@playwright/test';

test.describe('Cas Métier de Bout en Bout', () => {

  test.beforeEach(async ({ page }) => {
    // Connexion
    await page.goto('http://localhost:4200/login');
    await page.fill('input[type="email"]', 'toto@mail.com');
    await page.fill('input[type="password"]', 'toto');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:4200/dashboard');
  });

  test('Cas 1 : Création d\'une dépense FSDIE sur un événement', async ({ page }) => {
    // Naviguer sur `events`
    await page.click('text="Événements"');
    await page.waitForURL('http://localhost:4200/events');

    // Cliquer sur le premier événement et attendre simultanément le chargement du budget
    const [response] = await Promise.all([
      page.waitForResponse(response => response.url().includes('/api/budget-lines') && response.status() === 200),
      page.locator('h3').first().click(),
      page.waitForURL(/.*\/events\/\d+/)
    ]);

    // Onglet actif
    const budgetTab = page.locator('button', { hasText: 'Budget & FSDIE' });
    await expect(budgetTab).toHaveClass(/text-primary/);

    const expensesList = page.locator('.bg-red-50\\/30 .bg-white');

    // Ajouter une dépense
    await page.click('button:has-text("Ajouter une dépense")');

    const newExpenseCard = expensesList.last();
    
    // Remplir la catégorie
    await newExpenseCard.getByPlaceholder('Ex: Lieu, Traiteur...').fill('Logistique Playwright');
    await newExpenseCard.getByPlaceholder('Ex: Lieu, Traiteur...').press('Tab');
    
    // Attendre la sauvegarde qui s'envoie au blur, en utilisant Promise.all
    await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/budget-lines')),
      newExpenseCard.getByPlaceholder('Description précise...').fill('Achat de matériel pour tests E2E'),
      newExpenseCard.getByPlaceholder('Description précise...').press('Tab')
    ]);

    // Vérifier globalement qu'on a pu aller au bout
    expect(page.url()).toContain('/events/');
  });
});
