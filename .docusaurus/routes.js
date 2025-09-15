import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/bmr-docs/markdown-page',
    component: ComponentCreator('/bmr-docs/markdown-page', 'f55'),
    exact: true
  },
  {
    path: '/bmr-docs/search',
    component: ComponentCreator('/bmr-docs/search', '795'),
    exact: true
  },
  {
    path: '/bmr-docs/docs',
    component: ComponentCreator('/bmr-docs/docs', '85e'),
    routes: [
      {
        path: '/bmr-docs/docs',
        component: ComponentCreator('/bmr-docs/docs', 'c45'),
        routes: [
          {
            path: '/bmr-docs/docs',
            component: ComponentCreator('/bmr-docs/docs', 'f44'),
            routes: [
              {
                path: '/bmr-docs/docs/category/video-tutorials',
                component: ComponentCreator('/bmr-docs/docs/category/video-tutorials', '26f'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/bmr-docs/docs/getting-started/account-setup',
                component: ComponentCreator('/bmr-docs/docs/getting-started/account-setup', '9d8'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/bmr-docs/docs/getting-started/faq',
                component: ComponentCreator('/bmr-docs/docs/getting-started/faq', 'efb'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/bmr-docs/docs/getting-started/system-requirements',
                component: ComponentCreator('/bmr-docs/docs/getting-started/system-requirements', 'e25'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/bmr-docs/docs/intro',
                component: ComponentCreator('/bmr-docs/docs/intro', '736'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/bmr-docs/docs/lifecycle/deployment/',
                component: ComponentCreator('/bmr-docs/docs/lifecycle/deployment/', 'c8a'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/bmr-docs/docs/lifecycle/design/',
                component: ComponentCreator('/bmr-docs/docs/lifecycle/design/', '107'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/bmr-docs/docs/lifecycle/discovery/',
                component: ComponentCreator('/bmr-docs/docs/lifecycle/discovery/', '928'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/bmr-docs/docs/lifecycle/maintenance/',
                component: ComponentCreator('/bmr-docs/docs/lifecycle/maintenance/', '68d'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/bmr-docs/docs/recommendations/',
                component: ComponentCreator('/bmr-docs/docs/recommendations/', 'acf'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/bmr-docs/docs/recommendations/speakers-for-acoustics',
                component: ComponentCreator('/bmr-docs/docs/recommendations/speakers-for-acoustics', 'eef'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/bmr-docs/docs/release-notes/2025-07-beta-release-01',
                component: ComponentCreator('/bmr-docs/docs/release-notes/2025-07-beta-release-01', '955'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/bmr-docs/docs/release-notes/2025-08-beta-release-02',
                component: ComponentCreator('/bmr-docs/docs/release-notes/2025-08-beta-release-02', '7c0'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/bmr-docs/docs/release-notes/2025-09-beta-release-03',
                component: ComponentCreator('/bmr-docs/docs/release-notes/2025-09-beta-release-03', '759'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/bmr-docs/docs/tutorials/acoustics-guide',
                component: ComponentCreator('/bmr-docs/docs/tutorials/acoustics-guide', '431'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/bmr-docs/docs/tutorials/scan-marker-guide',
                component: ComponentCreator('/bmr-docs/docs/tutorials/scan-marker-guide', '887'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/bmr-docs/docs/video-tutorials/video-acoustics-guide',
                component: ComponentCreator('/bmr-docs/docs/video-tutorials/video-acoustics-guide', '1fd'),
                exact: true,
                sidebar: "docs"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/bmr-docs/',
    component: ComponentCreator('/bmr-docs/', '4a9'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
