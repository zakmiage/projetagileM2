import { test, expect } from '@playwright/test';

test.describe('Authentication (TUT)', () => {
  test('devrait réussir à se connecter avec les bonnes informations', async ({ page }) => {
    // Naviguer sur la page de login
    await page.goto('http://localhost:4200/login');

    // Vérifier qu'on est sur la bonne page
    await expect(page).toHaveURL('http://localhost:4200/login');

    // Remplir le formulaire
    await page.fill('input[type="email"]', 'toto@mail.com');
    await page.fill('input[type="password"]', 'toto');

    // Soumettre le formulaire
    await page.click('button[type="submit"]');

    // Le login nous redirige vers le dashboard ou les events
    await page.waitForURL('http://localhost:4200/dashboard', { timeout: 5000 });

    // Vérifier la présence d'un élément indiquant que l'utilisateur est connecté, ex: sidebar ou header "Événements"
    await expect(page.locator('app-layout')).toBeVisible();
  });

  test('devrait échouer avec de mauvaises informations', async ({ page }) => {
    await page.goto('http://localhost:4200/login');

    await page.fill('input[type="email"]', 'fake@mail.com');
    await page.fill('input[type="password"]', 'wrong');

    await page.click('button[type="submit"]');

    // Le message d'erreur ou le maintien sur la même page
    await expect(page).toHaveURL('http://localhost:4200/login');
  });
});
