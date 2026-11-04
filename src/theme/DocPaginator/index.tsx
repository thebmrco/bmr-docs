import React from 'react';
import DocPaginator from '@theme-original/DocPaginator';
import {useLocation} from '@docusaurus/router';

// Release notes are listed newest first, so the sidebar order would make
// "Previous" the newer release. On release notes, Previous is the older
// release and Next the newer one; links that leave the release notes are dropped.
const isReleaseNote = (link?: {permalink: string}) => !!link?.permalink.includes('/release-notes/');

export default function DocPaginatorWrapper(props) {
  const {pathname} = useLocation();
  if (!pathname.includes('/release-notes/')) {
    return <DocPaginator {...props} />;
  }
  const newer = isReleaseNote(props.previous) ? props.previous : undefined;
  const older = isReleaseNote(props.next) ? props.next : undefined;
  return <DocPaginator {...props} previous={older} next={newer} />;
}
