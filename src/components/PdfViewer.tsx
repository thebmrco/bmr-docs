/**
 * Shows a PDF inline, with a download bar above it.
 *
 * The bar is the primary action — it always works, on every device. The
 * embedded view below it is a convenience for people on a computer.
 *
 * Browsers that cannot render a PDF inline (notably Safari on iPhone and
 * iPad, which ignores the embed and shows nothing) fall through to the
 * `<object>` fallback, which offers the same open/download action rather
 * than leaving a blank frame.
 *
 * Usage in MDX:
 *   import PdfViewer from '@site/src/components/PdfViewer'
 *
 *   <PdfViewer
 *     file="/guides/bmr-room-capture-guide.pdf"
 *     label="Room Capture Guide"
 *     size="4.5 MB"
 *   />
 */
import React from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";

type PdfViewerProps = {
  /** Site-absolute path to the PDF, e.g. "/guides/thing.pdf". */
  file: string;
  /** Name of the document, used in the download bar and the fallback. */
  label: string;
  /** Human-readable file size, e.g. "4.5 MB". */
  size?: string;
  /** Height of the inline view. Defaults to a comfortable reading height. */
  height?: string;
};

export default function PdfViewer({
  file,
  label,
  size,
  height = "min(82vh, 900px)",
}: PdfViewerProps) {
  const src = useBaseUrl(file);

  return (
    <div className="bmr-pdf">
      <div className="bmr-pdf__bar">
        <div className="bmr-pdf__meta">
          <strong>{label}</strong>
          <span>PDF{size ? ` · ${size}` : ""}</span>
        </div>
        <a className="bmr-pdf__download" href={src} download>
          Download the PDF
        </a>
      </div>

      <object
        className="bmr-pdf__frame"
        data={src}
        type="application/pdf"
        style={{ height }}
        aria-label={label}
      >
        <div className="bmr-pdf__fallback">
          <p>
            Your browser cannot show PDFs inline — this is normal on iPhone and
            iPad.
          </p>
          <a className="bmr-pdf__download" href={src} target="_blank" rel="noopener noreferrer">
            Open the PDF
          </a>
        </div>
      </object>
    </div>
  );
}
