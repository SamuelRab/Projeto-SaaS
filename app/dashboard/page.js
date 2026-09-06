'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function Dashboard() {
  const [laudos, setLaudos] = useState([])

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from('laudos')
        .select('*')
        .order('created_at', { ascending: false })
      setLaudos(data || [])
    }
    carregar()

    // Realtime: atualiza sozinho quando o status muda
    const canal = supabase
      .channel('laudos-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'laudos' }, carregar)
      .subscribe()

    return () => supabase.removeChannel(canal)
  }, [])

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Painel</h1>
        <Link href="/novo-laudo" className="bg-blue-600 text-white px-4 py-2 rounded">
          + Novo Laudo
        </Link>
      </div>

      {laudos.map((l) => (
        <Link
          key={l.id}
          href={`/laudo/${l.id}`}
          className={`block p-4 mb-3 rounded border-l-4 ${
            l.status === 'aprovado' ? 'border-green-600 bg-green-50' : 'border-yellow-500 bg-yellow-50'
          }`}
        >
          <p className="font-bold">{l.placa || 'Placa pendente'}</p>
          <p className="text-sm text-gray-600">{l.status.toUpperCase()}</p>
        </Link>
      ))}
    </div>
  )
}