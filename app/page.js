'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    async function verificar() {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
    verificar()
  }, [])

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-gray-500">Carregando...</p>
    </div>
  )
}