/**
 * An annotated screenshot: numbered pins on the image, numbered list beneath.
 *
 * The pin carries the location, the list carries the meaning — neither repeats
 * the other. Use this instead of a bulleted feature list on any page whose job
 * is "where is the thing".
 *
 * Usage in MDX:
 *   import Callouts from '@site/src/components/Callouts'
 *
 *   <Callouts
 *     src="/img/design/bmr-studio-ui.webp"
 *     alt="The BMR Studio window"
 *     caption="BMR Studio in View mode."
 *     pins={[
 *       {x: 74, y: 11, title: 'Render mode', text: 'Standard or High quality.'},
 *       {x: 88, y: 38, title: 'Rendering panel', text: 'Quality presets and exposure.'},
 *       {x: 66, y: 93, title: 'Present', text: 'Full screen, step by step (Shift + F).'},
 *     ]}
 *   />
 *
 * `x` and `y` are percentages of the image box, measured from the top left, so
 * pins stay put as the image scales.
 */
import React from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";

export type Pin = {
  /** Horizontal position as a percentage of image width. */
  x: number;
  /** Vertical position as a percentage of image height. */
  y: number;
  title: string;
  text?: React.ReactNode;
};

type CalloutsProps = {
  src: string;
  alt: string;
  caption: React.ReactNode;
  pins: Pin[];
};

export default function Callouts({ src, alt, caption, pins }: CalloutsProps) {
  const resolved = useBaseUrl(src);

  return (
    <figure className="bmr-figure bmr-callouts">
      <div className="bmr-callouts__frame">
        <img className="bmr-figure__img" src={resolved} alt={alt} loading="lazy" />
        {pins.map((pin, i) => (
          <span
            key={i}
            className="bmr-callouts__pin"
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            aria-hidden="true"
          >
            {i + 1}
          </span>
        ))}
      </div>

      <ol className="bmr-callouts__list">
        {pins.map((pin, i) => (
          <li key={i} className="bmr-callouts__item">
            <span className="bmr-callouts__num" aria-hidden="true">
              {i + 1}
            </span>
            <span>
              <strong>{pin.title}</strong>
              {pin.text ? <> — {pin.text}</> : null}
            </span>
          </li>
        ))}
      </ol>

      <figcaption className="bmr-figure__caption">{caption}</figcaption>
    </figure>
  );
}
