import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants'

interface PageProps {
  params: Promise<{
    houseSlug: string
  }>
}

export default async function PublicCanteenPage({ params }: PageProps) {
  const { houseSlug } = await params
  redirect(ROUTES.PUBLIC_STORE(houseSlug))
}
