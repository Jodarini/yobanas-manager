import { createPage, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

describe('login page', async () => {
  await setup({
    host: 'http://localhost:3000',
  })

  it('displays the email and password fields', async () => {
    const page = await createPage('/login')
    expect(await page.getByPlaceholder('Email').isVisible()).toBe(true)
    expect(await page.getByPlaceholder('Contraseña').isVisible()).toBe(true)
    expect(await page.getByRole('button', { name: /iniciar sesión/i }).isVisible()).toBe(true)
  })

  it('login button is disabled when fields are empty', async () => {
    const page = await createPage('/login')
    await page.waitForSelector('[data-test-id="email"]')
    const loginButton = page.getByRole('button', { name: /iniciar sesión/i })
    expect(await loginButton.isDisabled()).toBe(true)
  })

  it('login button is enabled when fields are filled', async () => {
    const page = await createPage('/login')
    await page.waitForSelector('[data-test-id="email"]')

    await page.getByTestId('email').fill('user@example.com')
    await page.getByTestId('password').fill('password123')

    const loginButton = page.getByRole('button', { name: /iniciar sesión/i })
    expect(await loginButton.isDisabled()).toBe(false)
  })

  it('can login', async () => {
    const page = await createPage('/login')
    expect(await page.getByPlaceholder('Email').isVisible()).toBe(true)
    expect(await page.getByPlaceholder('Contraseña').isVisible()).toBe(true)
  })

})
