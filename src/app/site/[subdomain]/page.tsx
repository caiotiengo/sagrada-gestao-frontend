'use client'

import { useSiteContext } from '@/components/site/site-provider'
import { ClassicTemplate } from '@/components/site-templates/classic'
import { ModernTemplate } from '@/components/site-templates/modern'
import { MinimalTemplate } from '@/components/site-templates/minimal'

export default function SiteHomePage() {
  const { house } = useSiteContext()
  const template = house.siteConfig?.template || 'classic'

  switch (template) {
    case 'modern':
      return <ModernTemplate />
    case 'minimal':
      return <MinimalTemplate />
    default:
      return <ClassicTemplate />
  }
}
