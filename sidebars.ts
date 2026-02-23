import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/account-setup',
        'getting-started/system-requirements',
        'getting-started/faq',
      ],
    },
    {
      type: 'category',
      label: 'Lifecycle',
      items: [
        'lifecycle/discovery/index',
        'lifecycle/digital-twin/index',
        'lifecycle/design/index',
        'lifecycle/maintenance/index',
      ],
    },
    {
      type: 'category',
      label: 'Tutorials',
      items: [
        'tutorials/acoustics-guide',
        'tutorials/scan-marker-guide',
      ],
    },
    {
      type: 'category',
      label: 'Integrations',
      items: [
        'integrations/webex-control-hub-sync',
      ],
    },
    {
      type: 'category',
      label: 'Recommendations',
      items: [
        'recommendations/index',
        'recommendations/speakers-for-acoustics',
      ],
    },
    {
      type: 'category',
      label: 'Video Tutorials',
      items: [
        'video-tutorials/video-acoustics-guide',
      ],
    },
    {
      type: 'category',
      label: 'Release Notes',
      items: [
        'release-notes/2025-12-beta-release-08',
        'release-notes/2025-12-beta-release-07',
        'release-notes/2025-11-beta-release-06',
        'release-notes/2025-11-beta-release-05',
        'release-notes/2025-10-beta-release-04',
        'release-notes/2025-09-beta-release-03',
        'release-notes/2025-08-beta-release-02',
        'release-notes/2025-07-beta-release-01',
      ],
    },
    'roadmap/index',
  ],
};

export default sidebars;
