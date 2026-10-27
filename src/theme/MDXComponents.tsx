import MDXComponents from '@theme-original/MDXComponents'
import U from '@site/src/components/U'
import {
  Illustration, PageIntro, IllustratedSteps, IconRow, Checklist, FixList,
} from '@site/src/components/illustrations'
import Notice from '@site/src/components/Notice'
import FeatureToggle, {FeatureToggleTag} from '@site/src/components/FeatureToggle'

/**
 * Global MDX scope: <U m2={175} /> and the illustration library
 * (<PageIntro>, <Illustration>, <IllustratedSteps>, <Checklist>, <FixList>)
 * <Notice kind="…"/> and <FeatureToggle/> / <FeatureToggleTag/> work on any
 * docs page without an import.
 */
export default {
  ...MDXComponents,
  U,
  Illustration,
  PageIntro,
  IllustratedSteps,
  IconRow,
  Checklist,
  FixList,
  Notice,
  FeatureToggle,
  FeatureToggleTag,
}
