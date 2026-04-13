'use client'

import ProofDetails from '@/components/features/proof/ProofDetails'

interface ProofDetailsPageProps {
  params: {
    artifactId: string
  }
}

export default function ProofDetailsPage({ params }: ProofDetailsPageProps) {
  return <ProofDetails artifactId={params.artifactId} />
}
