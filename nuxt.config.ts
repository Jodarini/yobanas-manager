// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  app: {
    head: {
      title: "Yobana's Manager", // default fallback
      htmlAttrs: { lang: 'es' },
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/img/logo2sobreoscuro.ico',
        },
        // {
        //   rel: 'icon',
        //   type: 'image/png',
        //   sizes: '16x16',
        //   href: '/favicon-16x16.png',
        // },
        // {
        //   rel: 'icon',
        //   type: 'image/png',
        //   sizes: '32x32',
        //   href: '/favicon-32x32.png',
        // },
        // {
        //   rel: 'apple-touch-icon',
        //   sizes: '180x180',
        //   href: '/apple-touch-icon.png',
        // },
        // { rel: 'manifest', href: '/site.webmanifest' },
      ],
    },
  },
  compatibilityDate: '2024-04-03',
  runtimeConfig: {
    supabaseUrl: '',
    supabaseKey: '',
  },
  css: ['~/assets/css/tailwind.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  modules: [
    '@nuxt/image',
    'shadcn-nuxt',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    '@nuxt/eslint',
    '@nuxtjs/supabase',
  ],
  image: {
    dir: 'public', // or 'assets/images' if using assets
  },
  eslint: {},
  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: '',
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './components/ui',
  },
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/',
      include: undefined,
      exclude: [],
      saveRedirectToCookie: true, // Saves the path user tried to access
    },
  },
});
