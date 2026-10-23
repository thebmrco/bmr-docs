import MDXComponents from '@theme-original/MDXComponents'
import U from '@site/src/components/U'
import {
  Illustration, PageIntro, IllustratedSteps, IconRow, FixList,
} from '@site/src/components/illustrations'
import Notice from '@site/src/components/Notice'

/**
 * Global MDX scope: <U m2={175} /> and the illustration library
 * (<PageIntro>, <Illustration>, <IllustratedSteps>, <IconRow>, <FixList>)
 * and <Notice kind="…"/> work on any docs page without an import.
 */
export default {
  ...MDXComponents,
  U,
  Illustration,
  PageIntro,
  IllustratedSteps,
  IconRow,
  FixList,
  Notice,
}
