'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export function useAuth() {
  const router = useRouter()
  const [usuario, setUsuario] = useState(null)
  const [oficinaId, setOficinaId] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function verificar() {
      const { data: authData } = await supabase.auth.getUser()

      if (!authData.user) {
        router.push('/login')
        return
      }

      const { data: oficina } = await supabase
        .from('oficinas')
        .select('id')
        .eq('user_id', authData.user.id)
        .single()

      setUsuario(authData.user)
      setOficinaId(oficina?.id || null)
      setCarregando(false)
    }
    verificar()
  }, [])

  return { usuario, oficinaId, carregando }
}