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

  plugins: [
    // Pages merged into the three Discovery areas — keep their old URLs working.
    [
      require.resolve('@docusaurus/plugin-client-redirects'),
      {
        redirects: [
          { from: '/docs/lifecycle/discovery/scan-marker-guide', to: '/docs/lifecycle/discovery/room-scan#capture-flow' },
          { from: '/docs/lifecycle/discovery/scanning-best-practices', to: '/docs/lifecycle/discovery/room-scan#best-practices' },
          { from: '/docs/lifecycle/discovery/compass', to: '/docs/lifecycle/discovery/room-scan#compass-orientation' },
          { from: '/docs/lifecycle/discovery/markers-capture', to: '/docs/lifecycle/discovery/markers' },
          { from: '/docs/acoustics/video-acoustics-guide', to: '/docs/acoustics/acoustics-guide#video' },
          { from: '/docs/organisation', to: '/docs/structure' },
          { from: '/docs/organisation/settings', to: '/docs/structure/organisation' },
          { from: '/docs/getting-started/room-page', to: '/docs/structure/room' },
        ],
      },
    ],
    // ✅ Disable local search in CI builds to prevent Node File API error
    ...(!isCI
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
      : []),
  ],

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
