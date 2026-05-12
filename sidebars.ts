import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
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
      label: 'BMR Solution',
      items: [
        {
          type: 'category',
          label: 'Discovery',
          link: {
            type: 'doc',
            id: 'lifecycle/discovery/index',
          },
          items: [
            'lifecycle/discovery/scan-marker-guide',
            'lifecycle/discovery/scanning-best-practices',
            'acoustics/acoustics-guide',
            'acoustics/video-acoustics-guide',
          ],
        },
        {
          type: 'category',
          label: 'Design',
          link: {
            type: 'doc',
            id: 'lifecycle/design/index',
          },
          items: [
            'lifecycle/design/bmr-studio',
            'lifecycle/design/ar-design-guide',
            'lifecycle/design/equipment-catalog',
            'lifecycle/design/default-room-configuration',
          ],
        },
        'lifecycle/maintenance/index',
        {
          type: 'category',
          label: 'Integrations',
          items: [
            'integrations/cisco-vrc',
            'integrations/webex-control-hub-sync',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Technology & Concepts',
      items: [
        {
          type: 'category',
          label: 'Acoustics',
          items: [
            'acoustics/mos-score',
            'acoustics/speakers-for-acoustics',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Product Updates',
      items: [
        'roadmap/index',
        {
          type: 'category',
          label: 'Release Notes',
          items: [
            'release-notes/2026-05-beta-release-11',
            'release-notes/2026-03-beta-release-10',
            'release-notes/2026-02-beta-release-09',
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
      ],
    },
  ],
};

export default sidebars;
