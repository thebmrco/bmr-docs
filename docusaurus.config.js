// docusaurus.config.js
// Clean JavaScript version for universal build compatibility (Node 18–22)

const isCI = !!process.env.CI;

module.exports = {
  title: 'Better Meeting Rooms',
  tagline: 'Documentation',
  url: 'https://thebmrco.github.io',
  baseUrl: '/bmr-docs/',
  organizationName: 'thebmrco', // GitHub org/user
  projectName: 'bmr-docs', // GitHub repo
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
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
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
      title: 'Better Meeting Rooms',
      logo: {
        alt: 'BMR',
        src: 'img/logo.svg',
      },
      items: [
        { to: '/docs/intro', label: 'Docs', position: 'left' },
        { type: 'search', position: 'right' },
      ],
    },
    footer: {
      style: 'dark',
      links: [],
      copyright: `© ${new Date().getFullYear()} Better Meeting Rooms`,
    },
  },
};