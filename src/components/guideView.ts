/**
 * Which guide — Field, Manage & Design or All docs — the reader is browsing in.
 *
 * Docusaurus shows each doc with one fixed sidebar. To let a page that sits in
 * several sidebars keep the menu the reader came from, the chosen view is
 * remembered here: opening a guide's home page picks that guide, and every
 * later page is shown with it as long as the page is in that guide's sidebar.
 * Used by the swizzled DocRoot (left menu) and DocSidebarNavbarItem (navbar).
 */
import {useEffect, useSyncExternalStore} from 'react';
import type {PropSidebar} from '@docusaurus/plugin-content-docs';

const KEY = 'bmr-guide-view';

// The home page of each guide picks that guide.
const Entry: Record<string, string> = {
  '/docs/field': 'fieldSidebar',
  '/docs/admin': 'adminSidebar',
  '/docs/all': 'allSidebar',
};

type State = {view: string | null; shown: string | null};

let state: State | null = null;
const listeners = new Set<() => void>();

function read(): State {
  if (!state) {
    let view: string | null = null;
    try {
      view = sessionStorage.getItem(KEY);
    } catch {
      // storage blocked: fall back to the default sidebar of each page
    }
    state = {view, shown: null};
  }
  return state;
}

function write(next: Partial<State>) {
  const prev = read();
  if (Object.entries(next).every(([k, v]) => prev[k as keyof State] === v)) return;
  state = {...prev, ...next};
  if (next.view !== undefined && next.view !== null) {
    try {
      sessionStorage.setItem(KEY, next.view);
    } catch {
      // ignore
    }
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

const serverState: State = {view: null, shown: null};

function useGuideState(): State {
  return useSyncExternalStore(subscribe, read, () => serverState);
}

const trim = (p: string) => p.replace(/\/$/, '') || '/';

function sidebarHas(items: PropSidebar, pathname: string): boolean {
  return items.some((item) => {
    if (item.type === 'html') return false;
    if (item.href && trim(item.href) === pathname) return true;
    return item.type === 'category' && sidebarHas(item.items, pathname);
  });
}

/**
 * The sidebar to show for the current doc: the reader's chosen guide when the
 * doc is in it, otherwise the doc's own sidebar.
 */
export function useShownSidebar(
  pathname: string,
  defaultName: string | undefined,
  sidebars: Record<string, PropSidebar>,
): string | undefined {
  const path = trim(pathname);
  const {view: stored} = useGuideState();
  const view = Entry[path] ?? stored;
  const shown =
    view && view !== defaultName && sidebars[view] && sidebarHas(sidebars[view], path)
      ? view
      : defaultName;

  useEffect(() => {
    write({view: Entry[path] ?? read().view, shown: shown ?? null});
  }, [path, shown]);

  return shown;
}

/** The sidebar the current doc page is showing, for the navbar. */
export function useShownSidebarName(): string | null {
  return useGuideState().shown;
}
