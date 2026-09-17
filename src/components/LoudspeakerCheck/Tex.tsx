import katex from 'katex'
import 'katex/dist/katex.min.css'
import styles from './styles.module.css'

/** LaTeX rendered with KaTeX at render time, on the server as well: no runtime fetch. */
export function Tex({ children, display = false, left = false, n }: { children: string; display?: boolean; left?: boolean; n?: string }) {
  const html = katex.renderToString(children, { displayMode: display, throwOnError: true, output: 'html' })
  if (!display) return <span dangerouslySetInnerHTML={{ __html: html }} />
  if (left) return <div className={styles.texLeft} dangerouslySetInnerHTML={{ __html: html }} />
  return (
    <div className={styles.texDisplay}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      {n && <span className={styles.texNum}>({n})</span>}
    </div>
  )
}
