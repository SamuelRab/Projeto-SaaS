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

  if (!laudo) return <p className="p-6 text-center">Carregando orçamento...</p>

  return (
    <div className="max-w-md mx-auto p-6">
      {laudo.logo_oficina_url && (
        <img src={laudo.logo_oficina_url} className="h-14 mx-auto mb-4" />
      )}
      <h1 className="text-xl font-bold text-center mb-1">{laudo.nome_oficina}</h1>
      <p className="text-center text-gray-500 mb-6">Placa: {laudo.placa}</p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {laudo.fotos_avarias.map((url, i) => (
          <img key={i} src={url} className="rounded w-full" />
        ))}
      </div>

      <p className="bg-gray-50 border rounded p-4 mb-4">{laudo.descricao_laudo}</p>

      <p className="text-center text-2xl font-bold mb-6">R$ {laudo.valor_servico}</p>

      {laudo.status === 'aprovado' ? (
        <p className="text-center text-green-600 font-bold text-lg">✅ Serviço Aprovado!</p>
      ) : (
        <button
          onClick={handleAprovar}
          disabled={aprovando}
          className="w-full bg-green-600 text-white font-bold py-4 rounded text-lg"
        >
          {aprovando ? 'Confirmando...' : 'Aprovar Serviço'}
        </button>
      )}
    </div>
  )
}