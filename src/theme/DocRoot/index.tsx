/**
 * Swizzled (ejected) from @docusaurus/theme-classic DocRoot.
 * One change: the sidebar comes from useShownSidebar, so a page keeps the
 * guide the reader is browsing in (Field, Manage & Design or All docs) instead of
 * always showing the last sidebar that lists it.
 */
import React from 'react';
import clsx from 'clsx';
import {HtmlClassNameProvider, ThemeClassNames} from '@docusaurus/theme-common';
import {
  DocsSidebarProvider,
  useDocRootMetadata,
  useDocsVersion,
} from '@docusaurus/plugin-content-docs/client';
import {useLocation} from '@docusaurus/router';
import DocRootLayout from '@theme/DocRoot/Layout';
import NotFoundContent from '@theme/NotFound/Content';
import type {Props} from '@theme/DocRoot';
import {useShownSidebar} from '@site/src/components/guideView';

export default function DocRoot(props: Props): React.ReactNode {
  const currentDocRouteMetadata = useDocRootMetadata(props);
  const {docsSidebars} = useDocsVersion();
  const {pathname} = useLocation();
  const sidebarName = useShownSidebar(
    pathname,
    currentDocRouteMetadata?.sidebarName,
    docsSidebars,
  );
  if (!currentDocRouteMetadata) {
    // We only render the not found content to avoid a double layout
    return <NotFoundContent />;
  }
  const {docElement} = currentDocRouteMetadata;
  const sidebarItems = sidebarName ? docsSidebars[sidebarName] : undefined;
  return (
    <HtmlClassNameProvider className={clsx(ThemeClassNames.page.docsDocPage)}>
      <DocsSidebarProvider name={sidebarName} items={sidebarItems}>
        <DocRootLayout>{docElement}</DocRootLayout>
      </DocsSidebarProvider>
    </HtmlClassNameProvider>
  );
}
