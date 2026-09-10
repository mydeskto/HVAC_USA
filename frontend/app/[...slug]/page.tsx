import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { InnerPage } from '@/components/inner-page'
import { allSlugs, getPage } from '@/lib/pages'

type Props = { params: Promise<{ slug: string[] }> }

export function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug: slug.split('/') }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = getPage(slug.join('/'))
  if (!page) return { title: 'Page not found' }
  return { title: page.metaTitle, description: page.metaDescription }
}

export const dynamic = 'force-static'

export default async function CatchAllPage({ params }: Props) {
  const { slug } = await params
  const page = getPage(slug.join('/'))
  if (!page) notFound()
  return <InnerPage page={page} />
}
