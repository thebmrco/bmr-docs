// docusaurus.config.js
// Clean JavaScript version for universal build compatibility (Node 18–22)

// Google Analytics (gtag) only injects its script in production builds. Enabling
// it in dev makes client-side navigation throw "window.gtag is not a function",
// so restrict it to production.
const isProd = process.env.NODE_ENV === 'production';

// Protected local preview (npm run build:private, see scripts/access): no sitemap, no
// analytics, noindex on every page and a trap link for crawlers. The public build is unchanged.
// BMR_DOCS_SEARCH=off leaves out the full-text search index as well.
const isPrivate = process.env.BMR_DOCS_PRIVATE === '1';
const withSearch = process.env.BMR_DOCS_SEARCH !== 'off';

const noIndexDirectives = 'noindex, nofollow, noarchive, nosnippet, noimageindex, noai, noimageai';
const crawlerTrap = () => ({
  name: 'bmr-crawler-trap',
  // Off-screen and hidden from assistive technology; a request to it bans the caller (policy.mjs).
  injectHtmlTags() {
    return {
      postBodyTags: [
        {
          tagName: 'a',
          attributes: {
            href: '/internal-archive/',
            rel: 'nofollow noindex',
            tabindex: '-1',
            'aria-hidden': 'true',
            style: 'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden',
          },
          innerHTML: 'Archive',
        },
      ],
    };
  },
});

module.exports = {
  title: 'BETTERMEETINGROOMS',
  tagline: 'Documentation',
  url: 'https://docs.bettermeetingrooms.com',
  baseUrl: '/',
  organizationName: 'thebmrco', // GitHub org/user
  projectName: 'bmr-docs', // GitHub repo
  favicon: 'img/favicon.png',
  noIndex: isPrivate,
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

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
        sitemap: isPrivate ? false : undefined,
        gtag: isProd && !isPrivate
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
          { from: '/docs/lifecycle/digital-twin', to: '/docs/lifecycle/deploy' },
          { from: '/docs/intro', to: '/' },
        ],
      },
    ],
    // Local search. It used to be switched off in CI because of a Node File
    // API error; it builds fine on Node 22, which the deploy workflow uses.
    ...(withSearch
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
    ...(isPrivate ? [crawlerTrap] : []),
  ],

  themeConfig: {
    metadata: isPrivate ? [{ name: 'robots', content: noIndexDirectives }] : [],
    navbar: {
      title: 'BETTERMEETINGROOMS',
      logo: {
        alt: 'BMR',
        src: 'img/logo-green.svg',
      },
      items: [
        { type: 'docSidebar', sidebarId: 'fieldSidebar', label: 'Field', position: 'left' },
        { type: 'docSidebar', sidebarId: 'adminSidebar', label: 'Manage & Design', position: 'left' },
        // Every page, by area. Pages keep the view you chose (see src/components/guideView.ts).
        { type: 'docSidebar', sidebarId: 'allSidebar', label: 'All docs', position: 'left' },
        { label: "What's new", to: '/docs/release-notes', position: 'left' },
        ...(withSearch ? [{ type: 'search', position: 'right' }] : []),
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Field',
          items: [
            { label: 'Field home', to: '/docs/field' },
            { label: 'Room Capture Guide', to: '/docs/user-guides/room-capture' },
            { label: 'Acoustics', to: '/docs/acoustics/acoustics-guide' },
            { label: 'AR Design', to: '/docs/lifecycle/design/ar-design-guide' },
          ],
        },
        {
          title: 'Manage & Design',
          items: [
            { label: 'Manage & Design home', to: '/docs/admin' },
            { label: 'Inviting users', to: '/docs/getting-started/inviting-users' },
            { label: 'BMR Studio', to: '/docs/lifecycle/design/bmr-studio' },
            { label: 'Integrations', to: '/docs/integrations/microsoft-365' },
          ],
        },
        {
          title: 'Product',
          items: [
            { label: "What's new", to: '/docs/release-notes' },
            { label: 'Roadmap', to: '/docs/roadmap/' },
            { label: 'Trust & security', to: '/docs/trust' },
          ],
        },
        {
          title: 'Help',
          items: [
            { label: 'FAQ', to: '/docs/getting-started/faq' },
            { label: 'Send feedback', to: '/docs/getting-started/send-feedback' },
            { label: 'Web platform', href: 'https://app.bettermeetingrooms.com' },
          ],
        },
        {
          // Terms and Conditions live in the docs, under Legal.
          title: 'Legal',
          items: [
            { label: 'Privacy Policy', href: 'https://www.bettermeetingrooms.com/privacy-policy' },
            { label: 'Impressum', href: 'https://www.bettermeetingrooms.com/impressum' },
            { label: 'Terms and Conditions', to: '/docs/legal/terms' },
            { label: 'Trust & Security', to: '/docs/trust' },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} BETTERMEETINGROOMS`,
    },
  },
};
