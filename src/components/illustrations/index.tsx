/**
 * BMR illustration library — one look for every docs page.
 *
 * Available on every MDX page without an import (see src/theme/MDXComponents):
 *
 *   <Illustration name="scan" />
 *       One named drawing. Names: see the gallery at
 *       /docs/contributing/illustrations or scenes.tsx.
 *
 *   <PageIntro illustration="scan" meta={['BMR Mobile', '5 minutes']}>
 *     The first paragraph of the page.
 *   </PageIntro>
 *       The standard page opening, straight under the H1: lead text on the
 *       left, the illustration on the template's green facets on the right.
 *
 *   <IllustratedSteps steps={[{illustration, title, hint, link}]} done={[...]} />
 *       Numbered step cards for hub pages, each linking to its detail page.
 *
 *   <Checklist items={[{icon: 'Smartphone', label: 'BMR Mobile installed'}]}>note</Checklist>
 *       A tickable checklist, one item per line (icon names listed in RowIcons
 *       below). <IconRow> is the older name for the same thing.
 *
 *   <FixList items={[{problem, fix}]} />
 *       Problem → fix, one line each, for "Stuck?" sections.
 */
import React, {useEffect, useState, type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import {
  Check, Smartphone, Tablet, Laptop, Mail, Speaker, BatteryCharging, Wifi, DoorClosed,
  KeyRound, Users, Clock, Ruler, Camera, Volume2, Search,
} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';
import {Facets} from './parts';
import {Scenes} from './scenes';
import styles from './styles.module.css';

export {C, Facets} from './parts';
export {Scenes, illustrationNames} from './scenes';

export function Illustration({name, className}: {name: string; className?: string}) {
  const scene = Scenes[name];
  if (!scene) {
    throw new Error(`Unknown illustration "${name}". See src/components/illustrations/scenes.tsx.`);
  }
  return (
    <svg
      viewBox={scene.wide ? '0 0 320 170' : '0 0 160 110'}
      className={className}
      role="img"
      aria-label={scene.label}
      width="100%"
      height="100%">
      {scene.draw()}
    </svg>
  );
}

export function PageIntro({
  illustration,
  meta,
  children,
}: {
  illustration: string;
  meta?: string[];
  children: ReactNode;
}) {
  return (
    <div className={styles.intro}>
      <div className={styles.introText}>
        {children}
        {meta && meta.length > 0 && (
          <p className={styles.introMeta}>
            {meta.map((m) => <span key={m}>{m}</span>)}
          </p>
        )}
      </div>
      <div className={styles.introArt}>
        <Facets className={styles.facets} />
        <Illustration name={illustration} className={styles.introSvg} />
      </div>
    </div>
  );
}

type Step = {illustration: string; title: string; hint?: string; link?: string};

/** `numbered={false}` drops the step numbers, for cards that are not a sequence. */
export function IllustratedSteps({steps, done, numbered = true}: {steps: Step[]; done?: string[]; numbered?: boolean}) {
  return (
    <>
      <ol className={styles.steps} style={{'--step-count': steps.length > 5 ? 3 : steps.length} as React.CSSProperties}>
        {steps.map((s, i) => {
          const body = (
            <>
              {numbered && <span className={styles.stepNumber}>{i + 1}</span>}
              <Illustration name={s.illustration} className={styles.stepArt} />
              <strong>{s.title}</strong>
              {s.hint && <span className={styles.stepHint}>{s.hint}</span>}
              {s.link && <span className={styles.stepMore}>Read more →</span>}
            </>
          );
          return (
            <li key={s.title}>
              {s.link ? (
                <Link to={s.link} className={styles.step}>{body}</Link>
              ) : (
                <div className={styles.step}>{body}</div>
              )}
            </li>
          );
        })}
      </ol>
      {done && (
        <p className={styles.done}>
          <span>Done when</span>
          {done.map((d) => (
            <span key={d} className={styles.doneItem}><Check size={14} aria-hidden="true" /> {d}</span>
          ))}
        </p>
      )}
    </>
  );
}

/** Icons IconRow accepts. Add here when a page needs another one. */
const RowIcons: Record<string, LucideIcon> = {
  Smartphone, Tablet, Laptop, Mail, Speaker, BatteryCharging, Wifi, DoorClosed,
  KeyRound, Users, Clock, Ruler, Camera, Volume2, Search,
};

/**
 * A "have you got everything?" list: one item per line with a tick box the
 * reader can tick, like a paper checklist. An item can link to the page
 * that explains how to check it. Ticks are remembered in this
 * browser only. Children become a note at the bottom of the list.
 */
export function Checklist({
  items,
  children,
}: {
  items: {icon?: string; label: string; link?: string; linkLabel?: string}[];
  children?: ReactNode;
}) {
  const key = `bmr-checklist:${items.map((i) => i.label).join('|')}`;
  const [ticked, setTicked] = useState<string[]>([]);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) ?? '[]');
      if (Array.isArray(saved)) setTicked(saved);
    } catch {
      // storage blocked: start unticked
    }
  }, [key]);
  const toggle = (label: string) => {
    const next = ticked.includes(label) ? ticked.filter((l) => l !== label) : [...ticked, label];
    setTicked(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // storage blocked: ticks last until the page closes
    }
  };
  const allDone = ticked.length === items.length;
  return (
    <div className={styles.checklist}>
      <ul>
        {items.map(({icon, label, link, linkLabel}) => {
          const Icon = icon ? RowIcons[icon] : undefined;
          const on = ticked.includes(label);
          return (
            <li key={label} className={on ? styles.checked : undefined}>
              <label>
                <input type="checkbox" checked={on} onChange={() => toggle(label)} />
                <span className={styles.checkBox} aria-hidden="true">
                  {on && <Check size={14} strokeWidth={3} />}
                </span>
                <span className={styles.checkLabel}>{label}</span>
              </label>
              {link && (
                <Link to={link} className={styles.checkLink}>
                  {linkLabel ?? 'How to check'} →
                </Link>
              )}
              {Icon && <Icon size={18} className={styles.checkIcon} aria-hidden="true" />}
            </li>
          );
        })}
      </ul>
      {allDone && <div className={styles.checklistFoot}>All set. Off you go.</div>}
      {children && <div className={styles.checklistNote}>{children}</div>}
    </div>
  );
}

/** Older name for Checklist. */
export const IconRow = Checklist;

/** Every illustration with its name, for the contributor gallery. */
export function IllustrationGallery() {
  return (
    <div className={styles.gallery}>
      {Object.entries(Scenes).map(([name, scene]) => (
        <figure key={name} className={scene.wide ? styles.galleryWide : undefined}>
          <div className={styles.galleryArt}>
            <Illustration name={name} />
          </div>
          <figcaption>
            <code>{name}</code>
            <span>{scene.label}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export function FixList({items}: {items: {problem: string; fix: ReactNode}[]}) {
  return (
    <dl className={styles.fixList}>
      {items.map((f) => (
        <div key={f.problem}>
          <dt>{f.problem}</dt>
          <dd>{f.fix}</dd>
        </div>
      ))}
    </dl>
  );
}
