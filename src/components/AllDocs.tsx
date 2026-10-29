/**
 * Every page in the documentation, grouped by area. Built from the All docs
 * sidebar (allSidebar), so the page and that menu always match. Each link
 * is tagged with who it is for:
 *  - Field or Manage & Design (key: Admin) when only that guide lists it,
 *  - General when both guides list it, or the sidebar marks it with
 *    customProps: {guide: 'General'} (inherited by a category's pages).
 */
import React from 'react';
import Link from '@docusaurus/Link';
import {useDocsVersion} from '@docusaurus/plugin-content-docs/client';
import type {PropSidebar, PropSidebarItem} from '@docusaurus/plugin-content-docs';
import {
  Info, Scan, AudioLines, Palette, Users, Puzzle, Wrench, Boxes, ShieldCheck, Megaphone, Folder, Scale} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';
import styles from './AllDocs.module.css';

type Guide = 'Field' | 'Admin' | 'General';

/** Shown names of the guides; the keys stay short for code and CSS. */
const GuideLabel: Record<Guide, string> = {Field: 'Field', Admin: 'Manage & Design', General: 'General'};

type Entry = {href: string; label: string; guide: Guide};

const AreaIcons: Record<string, LucideIcon> = {
  'General Information': Info,
  Discovery: Scan,
  Acoustics: AudioLines,
  Design: Palette,
  'Organisation and Users': Users,
  Integrations: Puzzle,
  Maintenance: Wrench,
  'Catalog & 3D Models': Boxes,
  'Trust and Security': ShieldCheck,
  'Product Updates': Megaphone,
  Legal: Scale,
};

// Release notes: show the latest few, the rest are in the menu.
const RELEASE_NOTES_SHOWN = 4;

const trim = (p: string) => p.replace(/\/$/, '');

function hrefs(items: PropSidebar, into = new Set<string>()): Set<string> {
  for (const item of items) {
    if (item.type === 'html') continue;
    if (item.href) into.add(trim(item.href));
    if (item.type === 'category') hrefs(item.items, into);
  }
  return into;
}

export default function AllDocs() {
  const {docsSidebars, docs} = useDocsVersion();
  const titles = Object.fromEntries(Object.values(docs).map((d) => [d.id, d.title]));
  const inField = hrefs(docsSidebars.fieldSidebar ?? []);
  const inAdmin = hrefs(docsSidebars.adminSidebar ?? []);

  function guideOf(href: string, marked?: Guide): Guide {
    if (marked) return marked;
    const f = inField.has(href);
    const a = inAdmin.has(href);
    if (f && a) return 'General';
    return f ? 'Field' : 'Admin';
  }

  function collect(items: PropSidebarItem[], marked: Guide | undefined, into: Entry[]) {
    for (const item of items) {
      if (item.type === 'html') continue;
      const own = (item.customProps?.guide as Guide | undefined) ?? marked;
      if (item.href) {
        const href = trim(item.href);
        // The page title reads better out of context than a short sidebar label.
        const label =
          item.type === 'link'
            ? (item.docId && titles[item.docId]) || item.label
            : `${item.label} overview`;
        into.push({href, label, guide: guideOf(href, own)});
      }
      if (item.type === 'category') collect(item.items, own, into);
    }
  }

  // Top-level categories are the areas; top-level pages (this overview and
  // the two guide homes) are left out.
  const areas = (docsSidebars.allSidebar ?? [])
    .filter((item): item is Extract<PropSidebarItem, {type: 'category'}> => item.type === 'category')
    .map((cat) => {
      const entries: Entry[] = [];
      collect([cat], undefined, entries);
      return {title: cat.label, entries};
    });

  return (
    <div className={styles.grid}>
      {areas.map(({title, entries}) => {
        const Icon = AreaIcons[title] ?? Folder;
        const notes = entries.filter((e) => e.href.startsWith('/docs/release-notes/'));
        const shown = [...entries.filter((e) => !notes.includes(e)), ...notes.slice(0, RELEASE_NOTES_SHOWN)];
        return (
          <section key={title} className={styles.area}>
            <h2 className={styles.areaTitle}>
              <span className={styles.areaIcon}><Icon size={18} aria-hidden="true" /></span>
              {title}
            </h2>
            <ul className={styles.list}>
              {shown.map((e) => (
                <li key={e.href}>
                  <Link to={e.href}>{e.label}</Link>
                  <span className={styles[`tag${e.guide}`]}>{GuideLabel[e.guide]}</span>
                </li>
              ))}
            </ul>
            {notes.length > RELEASE_NOTES_SHOWN && (
              <p className={styles.more}>
                and {notes.length - RELEASE_NOTES_SHOWN} earlier release notes, in the menu under Product Updates
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}
