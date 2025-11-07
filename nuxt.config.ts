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
      ],
    },
  },
  experimental: {
    typescriptPlugin: true,
  },
  compatibilityDate: '2024-04-03',
  runtimeConfig: {
    databaseUrl: process.env.NUXT_DATABASE_URL,
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY,
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
    },
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
    prefix: '',
    componentDir: './app/components/ui',
  },
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/',
      include: undefined,
      exclude: ['/', '/password/*'],
      saveRedirectToCookie: true, // Saves the path user tried to access
    },
  },
  hooks: {
    'vite:extendConfig': extendViteConfig,
  },
});

function extendViteConfig(config: import('vite').UserConfig) {
  const plugin = config.plugins?.find((plugin) =>
    isPlugin(plugin, 'nuxt:environments')
  );
  if (plugin) plugin.enforce = 'pre';
}

function isPlugin(
  plugin: unknown,
  name: string
): plugin is import('vite').Plugin {
  return !!(
    plugin &&
    typeof plugin === 'object' &&
    'name' in plugin &&
    plugin.name === name
  );
}
