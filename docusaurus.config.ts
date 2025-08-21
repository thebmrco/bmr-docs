// docusaurus.config.ts
import type {Config} from '@docusaurus/types';

const config: Config = {
  title: 'Better Meeting Rooms',
  tagline: 'Documentation',
  url: 'https://thebmrco.github.io',      // <-- set your site URL
  baseUrl: '/bmr-docs/',                        // keep as-is if this worked before
  organizationName: 'thebmrco',
  projectName: 'bmr-docs',
  deploymentBranch: 'gh-pages',
  favicon: 'img/favicon.ico',

  // Used by deployment (can be anything you prefer)
  organizationName: 'better-meeting-rooms',
  projectName: 'docs',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: { defaultLocale: 'en', locales: ['en'] },

  presets: [
    [
      'classic',
      {
        docs: {
          // IMPORTANT: use the default sidebar id "tutorialSidebar"
          sidebarPath: require.resolve('./sidebars.ts'),
          // If your docs should live at /docs (default), leave routeBasePath undefined.
          // routeBasePath: 'docs',
        },
        blog: false,
        theme: {
          // Keep if you have a custom CSS file; otherwise you can remove this line.
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'Better Meeting Rooms',
      logo: { alt: 'BMR', src: 'img/logo.svg' }, // optional
      items: [
        // Simple link to docs home/welcome:
        { to: '/docs/intro', label: 'Docs', position: 'left' },
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