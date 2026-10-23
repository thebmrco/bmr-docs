/**
 * Swizzled (ejected) from @docusaurus/theme-classic DocSidebarNavbarItem.
 * One change: the item is active when its sidebar is the one the page is
 * showing (see guideView), not only the doc's default sidebar.
 */
import React from 'react';
import {
  useActiveDocContext,
  useLayoutDocsSidebar,
} from '@docusaurus/plugin-content-docs/client';
import DefaultNavbarItem from '@theme/NavbarItem/DefaultNavbarItem';
import type {Props} from '@theme/NavbarItem/DocSidebarNavbarItem';
import {useShownSidebarName} from '@site/src/components/guideView';

export default function DocSidebarNavbarItem({
  sidebarId,
  label,
  docsPluginId,
  ...props
}: Props): React.ReactNode {
  const {activeDoc} = useActiveDocContext(docsPluginId);
  const shown = useShownSidebarName();
  const sidebarLink = useLayoutDocsSidebar(sidebarId, docsPluginId).link;
  if (!sidebarLink) {
    throw new Error(
      `DocSidebarNavbarItem: Sidebar with ID "${sidebarId}" doesn't have anything to be linked to.`,
    );
  }
  return (
    <DefaultNavbarItem
      exact
      {...props}
      isActive={() => !!activeDoc && (shown ?? activeDoc.sidebar) === sidebarId}
      label={label ?? sidebarLink.label}
      to={sidebarLink.path}
    />
  );
}
