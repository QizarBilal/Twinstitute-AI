'use client'

import PublicProofProfile from '@/components/features/proof/PublicProofProfile'

interface ProofProfilePageProps {
  params: {
    userId: string
  }
}

export default function ProofProfilePage({ params }: ProofProfilePageProps) {
  return <PublicProofProfile userId={params.userId} />
}
