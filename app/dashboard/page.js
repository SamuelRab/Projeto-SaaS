'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/protegerPagina'
import Link from 'next/link'

export default function Dashboard() {
  const { usuario, oficinaId, carregando } = useAuth()
  const [laudos, setLaudos] = useState([])
  const laudosRef = useRef([])
  const audioRef = useRef(null)

  useEffect(() => {
    if (!oficinaId) return

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    async function carregarLaudos() {
      const { data } = await supabase
        .from('laudos')
        .select('*')
        .eq('oficina_id', oficinaId)
        .order('created_at', { ascending: false })

      if (data) {
        setLaudos(data)
        laudosRef.current = data
      }
    }
    carregarLaudos()

    const canal = supabase
      .channel('laudos-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'laudos' }, (payload) => {
        const laudoAntigo = laudosRef.current.find(l => l.id === payload.new.id)
        if (laudoAntigo && laudoAntigo.status !== 'aprovado' && payload.new.status === 'aprovado') {
          tocarSom()
          mostrarNotificacao(payload.new)
        }
        carregarLaudos()
      })
      .subscribe()

    return () => supabase.removeChannel(canal)
  }, [oficinaId])

  function tocarSom() {
    if (!audioRef.current) {
      audioRef.current = new Audio('https://cdn.pixabay.com/audio/2022/03/10/audio_a1b1b48372.mp3')
    }
    audioRef.current.play().catch(() => {})
  }

  function mostrarNotificacao(laudo) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Serviço aprovado', {
        body: `Placa ${laudo.placa} — o cliente aprovou o orçamento.`,
        icon: '/favicon.ico'
      })
    }
  }

  async function sair() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-night flex items-center justify-center">
        <p className="text-muted">Carregando...</p>
      </div>
    )
  }
  if (!usuario) return null

  const pendentes = laudos.filter(l => l.status !== 'aprovado').length
  const aprovados = laudos.filter(l => l.status === 'aprovado').length

  return (
    <div className="min-h-screen bg-night">
      <div className="border-b border-line px-6 py-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <div className="w-6 h-1 bg-accent rounded-full mb-2" />
            <h1 className="font-display text-3xl text-white leading-none">Painel</h1>
          </div>
          <button onClick={sair} className="text-sm text-muted hover:text-white transition-colors">
            Sair
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 pt-6">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-surface border border-line rounded-lg p-4">
            <p className="text-2xl font-display text-warn">{pendentes}</p>
            <p className="text-xs text-muted mt-0.5">Aguardando</p>
          </div>
          <div className="bg-surface border border-line rounded-lg p-4">
            <p className="text-2xl font-display text-ok">{aprovados}</p>
            <p className="text-xs text-muted mt-0.5">Aprovados</p>
          </div>
        </div>

        <Link
          href="/novo-laudo"
          className="block text-center bg-accent hover:bg-accent-dark transition-colors text-white font-semibold py-3.5 rounded-lg mb-6"
        >
          + Novo laudo
        </Link>

        {laudos.length === 0 && (
          <p className="text-muted text-center text-sm mt-10">
            Nenhum laudo criado ainda. Comece pelo botão acima.
          </p>
        )}

        <div className="space-y-2 pb-10">
          {laudos.map((l) => {
            const aprovado = l.status === 'aprovado'
            return (
              <Link
                key={l.id}
                href={`/laudo/${l.id}`}
                className="flex items-center justify-between bg-surface border border-line hover:border-accent/50 transition-colors rounded-lg px-4 py-3.5"
              >
                <div>
                  <p className="font-mono text-white tracking-wide">{l.placa || 'Placa pendente'}</p>
                  <p className={`text-xs mt-0.5 ${aprovado ? 'text-ok' : 'text-warn'}`}>
                    {aprovado ? 'Aprovado' : l.status === 'processando' ? 'Processando' : 'Aguardando cliente'}
                  </p>
                </div>
                <div className={`w-2 h-2 rounded-full ${aprovado ? 'bg-ok' : 'bg-warn'}`} />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}