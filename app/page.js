'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function Home() {
  const router = useRouter()
  const [checando, setChecando] = useState(true)

  useEffect(() => {
    async function verificar() {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        router.push('/dashboard')
      } else {
        setChecando(false)
      }
    }
    verificar()
  }, [])

  if (checando) {
    return (
      <div className="min-h-screen bg-night flex items-center justify-center">
        <p className="text-muted">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-night flex flex-col">
      <div className="relative overflow-hidden border-b border-line">
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-accent/10 rotate-12 blur-3xl" />
        <div className="max-w-md mx-auto px-6 pt-20 pb-16 relative">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-1.5 bg-accent rounded-full" />
            <span className="text-sm text-muted">Estética Automotiva</span>
          </div>
          <h1 className="font-display text-5xl leading-[0.95] text-white mb-4">
            Laudos e orçamentos<br />em <span className="text-accent">2 minutos.</span>
          </h1>
          <p className="text-muted text-base max-w-xs">
            Fotografe o veículo, deixe a IA escrever o laudo, e envie o orçamento direto no WhatsApp.
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto w-full px-6 py-10 flex-1 flex flex-col justify-center gap-3">
        <Link
          href="/login"
          className="block text-center bg-accent hover:bg-accent-dark transition-colors text-white font-semibold py-4 rounded-lg"
        >
          Entrar na minha oficina
        </Link>
        <Link
          href="/cadastro"
          className="block text-center border border-line hover:border-accent transition-colors text-white font-semibold py-4 rounded-lg"
        >
          Cadastrar minha oficina
        </Link>
      </div>
    </div>
  )
}