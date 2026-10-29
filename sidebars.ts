import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// Two audiences, two sidebars, plus an All docs sidebar with every page by
// area (declared first, so it is never a page's default). Doc ids — and therefore URLs — are unchanged;
// only the grouping differs. Pages for the person in the room live in
// fieldSidebar; pages for managing and designing rooms (the Manage & Design
// guide) live in adminSidebar.
// Getting-started pages are listed in both. Docusaurus shows a shared page
// with the last sidebar that lists it, so fieldSidebar is declared last:
// the person in the room gets the simpler navigation.

// Highlight recent changes in the menu. Move a page out of these lists once
// the release it belongs to is no longer the latest one.
const newDoc = (id: string) => ({type: 'doc' as const, id, className: 'badge-new'});
const updatedDoc = (id: string) => ({type: 'doc' as const, id, className: 'badge-updated'});

const releaseNotes = {
  type: 'category' as const,
  label: 'Release Notes',
  items: [
    newDoc('release-notes/2026-10-release-2.4'),
    updatedDoc('release-notes/2026-10-release-2.3'),
    'release-notes/2026-09-release-2.2',
    'release-notes/2026-09-release-2.1',
    'release-notes/2026-08-release-2.0',
    'release-notes/2026-07-release-1.4-final',
    'release-notes/2026-07-release-1.4',
    'release-notes/2026-06-release-1.3',
    'release-notes/2026-05-release-1.2',
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
};

const area = (label: string, items: any[]) => ({type: 'category' as const, label, items});
const general = (id: string) => ({type: 'doc' as const, id, customProps: {guide: 'General'}});

const sidebars: SidebarsConfig = {
  allSidebar: [
    'all',
    'field/index',
    'admin/index',
    // For everyone, whichever guide they use. Pages listed in both the Field
    // and Manage & Design sidebars count as General automatically; customProps marks
    // the rest.
    area('General Information', [
      'getting-started/account-setup',
      'getting-started/system-requirements',
      'getting-started/notifications',
      'getting-started/faq',
      'getting-started/send-feedback',
      general('technology/ar-world-map'),
    ]),
    {
      type: 'category',
      label: 'Discovery',
      link: {type: 'doc', id: 'lifecycle/discovery/index'},
      items: [
        updatedDoc('user-guides/room-capture'),
        'lifecycle/discovery/room-scan',
        'lifecycle/discovery/markers',
        newDoc('lifecycle/discovery/inventory'),
      ],
    },
    area('Acoustics', [
      'acoustics/acoustics-guide',
      'acoustics/speakers-for-acoustics',
      'acoustics/loudspeaker-check/index',
      'acoustics/loudspeaker-check/method',
      'acoustics/reading-acoustic-results',
      'acoustics/mos-score',
    ]),
    {
      type: 'category',
      label: 'Design',
      link: {type: 'doc', id: 'lifecycle/design/index'},
      items: [
        'lifecycle/design/ar-design-guide',
        updatedDoc('lifecycle/design/bmr-studio'),
        'lifecycle/design/default-room-configuration',
        'lifecycle/deploy/index',
      ],
    },
    {
      type: 'category',
      label: 'Organisation and Users',
      link: {type: 'doc', id: 'structure/index'},
      items: [
        'getting-started/inviting-users',
        'structure/organisation',
        'structure/location',
        'structure/room',
      ],
    },
    area('Integrations', [
      'integrations/microsoft-365',
      'integrations/webex-control-hub-sync',
      'integrations/cisco-vrc',
    ]),
    area('Maintenance', ['lifecycle/maintenance/index']),
    {
      type: 'category',
      label: 'Catalog & 3D Models',
      className: 'badge-updated',
      link: {type: 'doc', id: 'catalog/index'},
      items: [
        'catalog/item-anatomy',
        'catalog/category-requirements',
        'catalog/3d-model-standards',
        'catalog/ports-and-devices',
        'catalog/requesting-items',
      ],
    },
    area('Trust and Security', [newDoc('trust/index'), 'security/index']),
    {...area('Legal', [newDoc('legal/terms')]), customProps: {guide: 'General'}},
    {...area('Product Updates', ['roadmap/index', releaseNotes]), customProps: {guide: 'General'}},
  ],

  adminSidebar: [
    'admin/index',
    {
      type: 'category',
      label: 'Analyse Rooms',
      items: [
        'acoustics/reading-acoustic-results',
        'acoustics/mos-score',
        'acoustics/loudspeaker-check/method',
      ],
    },
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/account-setup',
        'getting-started/inviting-users',
        'getting-started/notifications',
        'getting-started/system-requirements',
        'getting-started/send-feedback',
        'getting-started/faq',
      ],
    },
    {
      type: 'category',
      label: 'Structure',
      link: { type: 'doc', id: 'structure/index' },
      items: [
        {
          type: 'category',
          label: 'Organisation',
          link: { type: 'doc', id: 'structure/organisation' },
          items: [
            {
              type: 'category',
              label: 'Integrations',
              items: [
                'integrations/cisco-vrc',
                'integrations/webex-control-hub-sync',
                'integrations/microsoft-365',
              ],
            },
          ],
        },
        'structure/location',
        'structure/room',
      ],
    },
    {
      type: 'category',
      label: 'Room Lifecycle',
      items: [
        {
          type: 'category',
          label: 'Discovery',
          link: {type: 'doc', id: 'lifecycle/discovery/index'},
          items: [
            'lifecycle/discovery/room-scan',
            'lifecycle/discovery/markers',
            'acoustics/acoustics-guide',
            newDoc('lifecycle/discovery/inventory'),
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
            'lifecycle/design/ar-design-guide',
            updatedDoc('lifecycle/design/bmr-studio'),
            'lifecycle/design/default-room-configuration',
            'lifecycle/deploy/index',
          ],
        },
        'lifecycle/maintenance/index',
      ],
    },
    {
      type: 'category',
      label: 'Technology & Concepts',
      items: [
        'technology/ar-world-map',
        {
          type: 'category',
          label: 'Catalog & 3D Models',
          className: 'badge-updated',
          link: {
            type: 'doc',
            id: 'catalog/index',
          },
          items: [
            'catalog/item-anatomy',
            'catalog/category-requirements',
            'catalog/3d-model-standards',
            'catalog/ports-and-devices',
            'catalog/requesting-items',
          ],
        },
      ],
    },
    newDoc('trust/index'),
    'security/index',
    {
      type: 'category',
      label: 'Legal',
      items: [newDoc('legal/terms')],
    },
    {
      type: 'category',
      label: 'Product Updates',
      items: ['roadmap/index', releaseNotes],
    },
  ],

  fieldSidebar: [
    'field/index',
    {
      type: 'category',
      label: 'Before you go',
      items: [
        updatedDoc('user-guides/room-capture'),
        'getting-started/account-setup',
        'getting-started/system-requirements',
      ],
    },
    {
      type: 'category',
      label: 'Capture the room',
      link: {
        type: 'doc',
        id: 'lifecycle/discovery/index',
      },
      items: [
        'lifecycle/discovery/room-scan',
        'lifecycle/discovery/markers',
        newDoc('lifecycle/discovery/inventory'),
        'acoustics/acoustics-guide',
        'acoustics/speakers-for-acoustics',
        'acoustics/loudspeaker-check/index',
      ],
    },
    {
      type: 'category',
      label: 'Design on site',
      items: ['lifecycle/design/ar-design-guide'],
    },
    {
      type: 'category',
      label: 'Help',
      items: [
        'getting-started/faq',
        'getting-started/notifications',
        'getting-started/send-feedback',
      ],
    },
  ],
};

export default sidebars;
