/**
 * The single way to put an image on a docs page.
 *
 * Replaces hand-written `<img style={{...}}>` tags so that every screenshot on
 * the site shares one frame, and restyling them all is one edit in custom.css.
 *
 * Usage in MDX:
 *   import Figure, { FigurePair } from '@site/src/components/Figure'
 *
 *   <Figure
 *     src="/img/design/bmr-studio-ui.webp"
 *     alt="The BMR Studio window with the mode switcher at the bottom"
 *     caption="BMR Studio opens in View mode."
 *   />
 *
 * Variants:
 *   full   full content width — the default, for wide UI captures
 *   inset  centred and capped (maxWidth, default 420px) — for dialogs and panels
 *   phone  narrow portrait frame — for BMR Mobile screenshots
 *
 * A caption is required. If an image does not need a caption, it is decoration
 * and does not belong on the page. See the Style Guide.
 */
import React from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";

export type FigureVariant = "full" | "inset" | "phone";

type FigureProps = {
  src: string;
  alt: string;
  caption: React.ReactNode;
  variant?: FigureVariant;
  /** Cap for the `inset` and `phone` variants, in px. */
  maxWidth?: number;
};

export default function Figure({
  src,
  alt,
  caption,
  variant = "full",
  maxWidth,
}: FigureProps) {
  const resolved = useBaseUrl(src);
  const style = maxWidth ? { maxWidth: `${maxWidth}px` } : undefined;

  return (
    <figure className={`bmr-figure bmr-figure--${variant}`} style={style}>
      <img className="bmr-figure__img" src={resolved} alt={alt} loading="lazy" />
      <figcaption className="bmr-figure__caption">{caption}</figcaption>
    </figure>
  );
}

type PairItem = {
  src: string;
  alt: string;
  /** Short label under the image — "Standard", "High quality", "Before". */
  label: string;
};

type FigurePairProps = {
  a: PairItem;
  b: PairItem;
  /** Must name the difference between the two — that is the whole point. */
  caption: React.ReactNode;
};

function PairSide({ item }: { item: PairItem }) {
  const resolved = useBaseUrl(item.src);
  return (
    <div className="bmr-figure__pane">
      <img
        className="bmr-figure__img bmr-figure__img--pane"
        src={resolved}
        alt={item.alt}
        loading="lazy"
      />
      <span className="bmr-figure__label">{item.label}</span>
    </div>
  );
}

/**
 * Two captures, same crop, same size, with a caption that names the difference.
 * Use for Standard vs High quality, good vs poor coverage, before vs after.
 */
export function FigurePair({ a, b, caption }: FigurePairProps) {
  return (
    <figure className="bmr-figure bmr-figure--pair">
      <div className="bmr-figure__panes">
        <PairSide item={a} />
        <PairSide item={b} />
      </div>
      <figcaption className="bmr-figure__caption">{caption}</figcaption>
    </figure>
  );
}
