import { expect, test } from '@nuxt/test-utils/playwright';

test.describe('Product Edit Page', () => {
  test('displays product information correctly', async ({ page, goto }) => {
    // goto has built-in waiting for Nuxt hydration!
    await goto('/products/5', { waitUntil: 'hydration' });

    await expect(page.getByText('Información del Producto')).toBeVisible();

    const titleInput = page.locator('input[name="title"]');
    await expect(titleInput).toBeVisible();
    await expect(titleInput).not.toHaveValue('');
  });

  test('can update product title', async ({ page, goto }) => {
    await goto('/products/5', { waitUntil: 'hydration' });

    const titleInput = page.locator('input[name="title"]');
    await titleInput.clear();
    await titleInput.fill('Updated Product Name');

    await page.click('button:has-text("Actualizar producto")');
    await expect(
      page.getByText('Producto actualizado exitosamente')
    ).toBeVisible();
  });

  test('can add a new variant', async ({ page, goto }) => {
    await goto('/products/5', { waitUntil: 'hydration' });

    await page.click('button:has-text("Agregar variante")');

    await page.locator('input[name="variants[0].size"]').fill('M');
    await page.locator('input[name="variants[0].color"]').fill('Rojo');
    await page.locator('input[name="variants[0].stock"]').fill('10');

    await page.click('button:has-text("Actualizar variantes")');
    await expect(
      page.getByText('Variante actualizada exitosamente')
    ).toBeVisible();
  });

  test('shows validation errors for empty fields', async ({ page, goto }) => {
    await goto('/products/5', { waitUntil: 'hydration' });

    const titleInput = page.locator('input[name="title"]');
    await titleInput.clear();
    await page.click('button:has-text("Actualizar producto")');

    await expect(page.getByText('Error en el formulario')).toBeVisible();
  });
});
