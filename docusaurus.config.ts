// docusaurus.config.ts
import type { Config } from '@docusaurus/types';

const config: Config = {
  title: 'Better Meeting Rooms',
  tagline: 'Documentation',
  url: 'https://thebmrco.github.io',
  baseUrl: '/bmr-docs/',
  organizationName: 'thebmrco',           // ✅ keep as your GitHub org/user
  projectName: 'bmr-docs',                // ✅ keep as your GitHub repo
  deploymentBranch: 'gh-pages',
  favicon: 'img/favicon.ico',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.ts'),
          // routeBasePath: 'docs', // leave commented if you're using default /docs
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],

  plugins: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        language: ['en'],
        highlightSearchTermsOnTargetPage: true,
      },
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'Better Meeting Rooms',
      logo: {
        alt: 'BMR',
        src: 'img/logo.svg',
      },
      items: [
        { to: '/docs/intro', label: 'Docs', position: 'left' },
        { type: 'search', position: 'right' }, // ✅ Search bar in top navbar
      ],
    },
    footer: {
      style: 'dark',
      links: [],
      copyright: `© ${new Date().getFullYear()} Better Meeting Rooms`,
    },
  },
};

export default config;