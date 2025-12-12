// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  app: {
    head: {
      title: 'StockIt',
      htmlAttrs: { lang: 'es' },
      script: [
        {
          src: 'https://wompijs.wompi.com/libs/js/v1.js',
          'data-public-key': process.env.NUXT_PUBLIC_WOMPI_PUBLIC,
          defer: true,
        },
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/img/logo2sobreoscuro.ico',
        },
      ],
    },
  },
  nitro: {
    routeRules: {
      '/api/webhooks/wompi': {
        cors: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
        },
      },
    },
  },
  devServer: {
    host: '0.0.0.0', // Listen on all network interfaces
  },
  experimental: {
    typescriptPlugin: true,
  },
  compatibilityDate: '2024-04-03',
  runtimeConfig: {
    databaseUrl: '',
    wompiPrivateKey: '',
    wompiIntegrityKey: '',
    supabaseServiceRoleKey: '',
    cronSecret: '',
    public: {
      supabaseUrl: '',
      supabaseKey: '',
      siteUrl: '',
      wompiPublic: '',
    },
  },
  css: ['~/assets/css/tailwind.css'],
  vite: {
    server: {
      allowedHosts: [
        'localhost',
        '.ngrok-free.dev', // Allow all ngrok domains
        '.ngrok.io', // Old ngrok domains
      ],
    },
    plugins: [tailwindcss()],
  },
  modules: [
    '@nuxt/image',
    'shadcn-nuxt',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    '@nuxt/eslint',
    '@nuxtjs/supabase',
    'lucide-nuxt',
    '@nuxt/test-utils'
  ],
  image: {
    dir: 'public',
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
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_KEY,
    types: false, // Disable if you don't have generated types
    redirectOptions: {
      login: '/login',
      callback: '/',
      exclude: ['/', '/login', '/sign-up', '/password/*'],
      saveRedirectToCookie: true,
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
