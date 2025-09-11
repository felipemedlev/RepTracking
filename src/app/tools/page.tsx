'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header, BackButton } from '@/components/layout/Header'
import { OneRepMaxCalculator } from '@/components/tools/OneRepMaxCalculator'

export default function ToolsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return (
      <div className="bg-white min-h-screen">
        <Header
          title="Fitness Tools"
          leftAction={<BackButton onClick={() => router.back()} />}
        />
        <div className="p-4">
          <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <Header
        title="Fitness Tools"
        leftAction={<BackButton onClick={() => router.back()} />}
      />

      <div className="p-4">
        <OneRepMaxCalculator />
      </div>
    </div>
  )
}