/**
 * A hub page as one left-to-right journey: numbered stages with an
 * illustration and their links, arrows between them, stacked on phones.
 * <LinkGroups> ends the page with a few labelled groups of small links
 * instead of a grid of equal tiles.
 *
 *   <Journey stages={[
 *     {label: 'Set up', note: 'Once', illustration: 'organise', items: [
 *       {title: 'Locations and rooms', hint: 'One location per building', link: '/docs/structure'},
 *     ]},
 *   ]} loop="Rescan when the room changes" />
 */
import React from 'react';
import Link from '@docusaurus/Link';
import {ArrowRight, RotateCcw} from 'lucide-react';
import {Illustration} from './illustrations';
import Icon from './Icon';
import styles from './Journey.module.css';

type Item = {title: string; hint?: string; link: string};
type Stage = {label: string; note?: string; illustration: string; items: Item[]};

export default function Journey({stages, loop}: {stages: Stage[]; loop?: string}) {
  return (
    <div className={styles.journey}>
      <ol className={styles.stages} style={{'--stage-count': stages.length} as React.CSSProperties}>
        {stages.map((stage, i) => (
          <li key={stage.label} className={styles.stage}>
            <div className={styles.head}>
              <span className={styles.number}>{i + 1}</span>
              <span className={styles.label}>{stage.label}</span>
              {stage.note && <span className={styles.note}>{stage.note}</span>}
            </div>
            <Illustration name={stage.illustration} className={styles.art} />
            <ul className={styles.items}>
              {stage.items.map((item) => (
                <li key={item.link}>
                  <Link to={item.link} className={styles.item}>
                    <strong>{item.title}</strong>
                    {item.hint && <span>{item.hint}</span>}
                  </Link>
                </li>
              ))}
            </ul>
            {i < stages.length - 1 && (
              <span className={styles.arrow} aria-hidden="true">
                <ArrowRight size={18} />
              </span>
            )}
          </li>
        ))}
      </ol>
      {loop && (
        <p className={styles.loop}>
          <RotateCcw size={15} aria-hidden="true" /> {loop}
        </p>
      )}
    </div>
  );
}

type Group = {title: string; links: {label: string; icon: string; link: string}[]};

export function LinkGroups({groups}: {groups: Group[]}) {
  return (
    <div className={styles.groups}>
      {groups.map((group) => (
        <div key={group.title} className={styles.group}>
          <p className={styles.groupTitle}>{group.title}</p>
          <ul>
            {group.links.map((l) => (
              <li key={l.link}>
                <Link to={l.link} className={styles.groupLink}>
                  <Icon name={l.icon} size={16} />
                  <span>{l.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
