/**
 * An at-a-glance fact grid for reference pages.
 *
 * Puts the handful of facts a reader came for above the detail they did not.
 * Required furniture on every reference page — Security, MOS Score, Method,
 * System Requirements — so the answer arrives before the derivation.
 *
 * Usage in MDX:
 *   import FactGrid from '@site/src/components/FactGrid'
 *
 *   <FactGrid facts={[
 *     {label: 'Hosting', value: 'AWS Frankfurt', note: 'eu-central-1'},
 *     {label: 'Identity', value: 'Auth0', note: 'No passwords stored by BMR'},
 *     {label: 'In transit', value: 'TLS 1.2+'},
 *   ]} />
 *
 * Keep it to between three and eight facts. More than that is a table.
 */
import React from "react";

export type Fact = {
  /** What the fact is about — short, two or three words. */
  label: string;
  /** The answer itself. This is the part people scan for. */
  value: React.ReactNode;
  /** Optional qualifier, one short line. */
  note?: React.ReactNode;
};

type FactGridProps = {
  facts: Fact[];
  /** Heading above the grid. Defaults to "At a glance". */
  title?: string;
};

export default function FactGrid({ facts, title = "At a glance" }: FactGridProps) {
  return (
    <div className="bmr-factgrid">
      <p className="bmr-factgrid__title">{title}</p>
      <dl className="bmr-factgrid__items">
        {facts.map((fact, i) => (
          <div className="bmr-factgrid__item" key={i}>
            <dt className="bmr-factgrid__label">{fact.label}</dt>
            <dd className="bmr-factgrid__value">
              {fact.value}
              {fact.note ? (
                <span className="bmr-factgrid__note">{fact.note}</span>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
