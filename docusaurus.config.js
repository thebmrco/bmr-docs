// docusaurus.config.js
// Clean JavaScript version for universal build compatibility (Node 18–22)

const isCI = !!process.env.CI;
// Google Analytics (gtag) only injects its script in production builds. Enabling
// it in dev makes client-side navigation throw "window.gtag is not a function",
// so restrict it to production.
const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  title: 'BETTERMEETINGROOMS',
  tagline: 'Documentation',
  url: 'https://thebmrco.github.io',
  baseUrl: '/bmr-docs/',
  organizationName: 'thebmrco', // GitHub org/user
  projectName: 'bmr-docs', // GitHub repo
  deploymentBranch: 'gh-pages',
  favicon: 'img/favicon.png',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  onBrokenAnchors: 'ignore', 

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
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        gtag: isProd
          ? {
              trackingID: 'G-BQ0J57GZ8K',
              anonymizeIP: true,
            }
          : undefined,
      },
    ],
  ],

  // ✅ Disable local search in CI builds to prevent Node File API error
  plugins: !isCI
    ? [
        [
          require.resolve('@easyops-cn/docusaurus-search-local'),
          {
            indexPages: true,
            hashed: true,
            language: ['en'],
          },
        ],
      ]
    : [],

  themeConfig: {
    navbar: {
      title: 'BETTERMEETINGROOMS',
      logo: {
        alt: 'BMR',
        src: 'img/logo-green.svg',
      },
      items: [
        { type: 'search', position: 'right' },
      ],
    },
    footer: {
      style: 'dark',
      links: [],
      copyright: `© ${new Date().getFullYear()} BETTERMEETINGROOMS`,
    },
  },
};
