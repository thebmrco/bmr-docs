/**
 * The Organisation → Location → Room structure, drawn the same way on every
 * page that explains it.
 *
 *   <StructureMap />                 nested levels, what each holds, who manages it
 *   <StructurePath current="room" /> "you are here" strip at the top of a level's page
 *   <RolesMatrix />                  what each role can do; the one place roles are defined
 */
import React from 'react';
import Link from '@docusaurus/Link';
import {Landmark, Building2, Box, Check, Minus, ChevronRight, type LucideIcon} from 'lucide-react';
import styles from './Structure.module.css';

type LevelId = 'organisation' | 'location' | 'room';

const LEVELS: {id: LevelId; name: string; icon: LucideIcon; link: string; is: string; holds: string; role: string; example: string}[] = [
  {id: 'organisation', name: 'Organisation', icon: Landmark, link: '/docs/structure/organisation', is: 'Your company', holds: 'Users, settings, catalogs, integrations', role: 'Admin', example: 'ACME Ltd'},
  {id: 'location', name: 'Location', icon: Building2, link: '/docs/structure/location', is: 'A building or site', holds: 'Its rooms, floors and address', role: 'Location Manager', example: 'Vienna office'},
  {id: 'room', name: 'Room', icon: Box, link: '/docs/structure/room', is: 'One meeting room', holds: 'Scans, markers, acoustics, designs, documents', role: 'Room Manager', example: 'Aquarium, 3rd floor'},
];

function LevelHead({level}: {level: (typeof LEVELS)[number]}) {
  const I = level.icon;
  return (
    <div className={styles.levelHead}>
      <span className={styles.levelIcon}><I size={18} aria-hidden="true" /></span>
      <Link to={level.link} className={styles.levelName}>{level.name}</Link>
      <span className={styles.levelIs}>{level.is}</span>
      <span className={styles.role}>{level.role}</span>
    </div>
  );
}

export function StructureMap() {
  const [org, loc, room] = LEVELS;
  return (
    <div className={styles.map} role="img" aria-label="An organisation contains locations; a location contains rooms. Admins manage the organisation, Location Managers a location, Room Managers a room.">
      <div className={`${styles.level} ${styles.org}`}>
        <LevelHead level={org} />
        <p className={styles.holds}>{org.holds}</p>
        <div className={styles.children}>
          {[0, 1].map((n) => (
            <div key={n} className={`${styles.level} ${styles.loc} ${n === 1 ? styles.ghost : ''}`}>
              {n === 0 ? (
                <>
                  <LevelHead level={loc} />
                  <p className={styles.holds}>{loc.holds}</p>
                  <div className={styles.children}>
                    {[0, 1, 2].map((r) => (
                      <div key={r} className={`${styles.level} ${styles.room} ${r > 0 ? styles.ghost : ''}`}>
                        {r === 0 ? (
                          <>
                            <LevelHead level={room} />
                            <p className={styles.holds}><strong>{room.holds}</strong></p>
                          </>
                        ) : (
                          <span className={styles.ghostLabel}>Room</span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <span className={styles.ghostLabel}>Location</span>
              )}
            </div>
          ))}
        </div>
      </div>
      <p className={styles.legend}>
        <span className={styles.role}>Role</span> manages that level and everything inside it.
      </p>
    </div>
  );
}

export function StructurePath({current}: {current: LevelId}) {
  return (
    <nav className={styles.path} aria-label="Structure">
      {LEVELS.map((level, i) => {
        const I = level.icon;
        const active = level.id === current;
        return (
          <React.Fragment key={level.id}>
            {i > 0 && <ChevronRight size={16} className={styles.pathSep} aria-hidden="true" />}
            <Link to={level.link} className={`${styles.pathItem} ${active ? styles.pathActive : ''}`} aria-current={active ? 'page' : undefined}>
              <I size={16} aria-hidden="true" /> {level.name}
            </Link>
          </React.Fragment>
        );
      })}
      <Link to="/docs/structure" className={styles.pathHelp}>How it fits together</Link>
    </nav>
  );
}

type Can = boolean | string;
const ROLES = ['Admin', 'Location Manager', 'Room Manager'];
const ABILITIES: {task: string; can: [Can, Can, Can]}[] = [
  {task: 'Scan, markers, acoustics, designs', can: ['Every room', 'Its rooms', 'Its room']},
  {task: 'Add and delete rooms', can: ['Every location', 'Its location', false]},
  {task: 'Edit the location', can: [true, true, false]},
  {task: 'Invite users', can: [true, false, false]},
  {task: 'Organisation settings', can: [true, false, false]},
];

export function RolesMatrix() {
  return (
    <div className={styles.matrixWrap}>
      <table className={styles.matrix}>
        <thead>
          <tr>
            <th scope="col" aria-label="Task" />
            {ROLES.map((r, i) => (
              <th key={r} scope="col">
                <span className={styles.role}>{r}</span>
                <span className={styles.scope}>{['Whole organisation', 'One location', 'One room'][i]}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ABILITIES.map((a) => (
            <tr key={a.task}>
              <th scope="row">{a.task}</th>
              {a.can.map((c, i) => (
                <td key={i}>
                  {c === false ? (
                    <Minus size={16} className={styles.no} aria-label="No" />
                  ) : (
                    <span className={styles.yes}>
                      <Check size={16} aria-label="Yes" />
                      {typeof c === 'string' && <span>{c}</span>}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
