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

    // Pede permissão de notificação assim que o funcionário abre o painel
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

    // Escuta mudanças em tempo real
    const canal = supabase
      .channel('laudos-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'laudos' }, (payload) => {
        const laudoAntigo = laudosRef.current.find(l => l.id === payload.new.id)

        // Só notifica se o status mudou DE algo diferente PARA "aprovado"
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
      new Notification('✅ Serviço Aprovado!', {
        body: `Placa ${laudo.placa} — o cliente aprovou o orçamento.`,
        icon: '/favicon.ico'
      })
    }
  }

  async function sair() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (carregando) return <p className="p-6">Carregando...</p>
  if (!usuario) return null

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Painel</h1>
        <Link href="/novo-laudo" className="bg-blue-600 text-white px-4 py-2 rounded">
          + Novo Laudo
        </Link>
      </div>

      {laudos.length === 0 && (
        <p className="text-gray-400 text-center mt-10">Nenhum laudo ainda.</p>
      )}

      {laudos.map((l) => (
        <Link
          key={l.id}
          href={`/laudo/${l.id}`}
          className={`block p-4 mb-3 rounded border-l-4 ${
            l.status === 'aprovado' ? 'border-green-600 bg-green-50' : 'border-yellow-500 bg-yellow-50'
          }`}
        >
          <p className="font-bold text-gray-900">{l.placa || 'Placa pendente'}</p>
          <p className="text-sm text-gray-600">{l.status.toUpperCase()}</p>
        </Link>
      ))}

      <button onClick={sair} className="mt-6 text-sm text-gray-400 underline">
        Sair
      </button>
    </div>
  )
}