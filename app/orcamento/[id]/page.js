'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Orcamento() {
  const { id } = useParams()
  const [laudo, setLaudo] = useState(null)
  const [aprovando, setAprovando] = useState(false)

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase.from('laudos').select('*').eq('id', id).single()
      setLaudo(data)
    }
    carregar()
  }, [id])

  async function handleAprovar() {
    setAprovando(true)
    await supabase.from('laudos').update({ status: 'aprovado' }).eq('id', id)
    setLaudo({ ...laudo, status: 'aprovado' })
    setAprovando(false)
  }

  if (!laudo) {
    return (
      <div className="min-h-screen bg-night flex items-center justify-center">
        <p className="text-muted">Carregando orçamento...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-night">
      <div className="border-t-4 border-accent" />
      <div className="max-w-md mx-auto px-6 py-10">
        {laudo.logo_oficina_url && (
          <img src={laudo.logo_oficina_url} className="h-12 mx-auto mb-4 object-contain" />
        )}
        <h1 className="font-display text-2xl text-white text-center mb-1">{laudo.nome_oficina || 'Orçamento'}</h1>
        <p className="text-center text-muted text-sm font-mono mb-8">{laudo.placa}</p>

        <div className="grid grid-cols-2 gap-2 mb-5">
          {laudo.fotos_avarias.map((url, i) => (
            <img key={i} src={url} className="rounded-lg w-full border border-line" />
          ))}
        </div>

        <p className="bg-surface border border-line rounded-lg p-4 mb-6 text-gray-200 text-sm leading-relaxed">
          {laudo.descricao_laudo}
        </p>

        <p className="text-center font-display text-4xl text-white mb-8">R$ {laudo.valor_servico}</p>

        {laudo.status === 'aprovado' ? (
          <div className="text-center bg-ok/15 text-ok font-semibold py-4 rounded-lg">
            Serviço aprovado
          </div>
        ) : (
          <button
            onClick={handleAprovar}
            disabled={aprovando}
            className="w-full bg-accent hover:bg-accent-dark disabled:opacity-60 transition-colors text-white font-semibold py-4 rounded-lg text-lg"
          >
            {aprovando ? 'Confirmando...' : 'Aprovar serviço'}
          </button>
        )}
      </div>
    </div>
  )
}