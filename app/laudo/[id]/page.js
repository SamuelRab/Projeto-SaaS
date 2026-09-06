'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function VerLaudo() {
  const { id } = useParams()
  const [laudo, setLaudo] = useState(null)

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase.from('laudos').select('*').eq('id', id).single()
      setLaudo(data)
    }
    carregar()
  }, [id])

  if (!laudo) return <p className="p-6">Carregando laudo...</p>

  const linkOrcamento = `${window.location.origin}/orcamento/${laudo.id}`
  const textoMsg = `Olá! Segue o laudo do seu veículo placa ${laudo.placa || ''}:\n\n${laudo.descricao_laudo}\n\n💰 Valor: R$ ${laudo.valor_servico}\n\nVeja fotos e aprove aqui: ${linkOrcamento}`
  const linkWhatsapp = `https://wa.me/${laudo.whatsapp_cliente}?text=${encodeURIComponent(textoMsg)}`

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-2">Laudo Gerado</h1>
      <p className="mb-1"><strong>Placa:</strong> {laudo.placa || 'não identificada'}</p>
      <p className="mb-4"><strong>Status:</strong> {laudo.status}</p>

      <img src={laudo.foto_placa_url} className="w-full rounded mb-2" />
      <div className="grid grid-cols-2 gap-2 mb-4">
        {laudo.fotos_avarias.map((url, i) => (
          <img key={i} src={url} className="w-full rounded" />
        ))}
      </div>

      <p className="bg-gray-100 p-3 rounded mb-2 text-sm text-gray-800">{laudo.descricao_laudo}</p>

      <label className="block text-sm font-medium mb-1">Valor do serviço (edite se quiser)</label>
      <input
        type="number"
        value={laudo.valor_servico}
        onChange={(e) => setLaudo({ ...laudo, valor_servico: e.target.value })}
        onBlur={async (e) => {
          await supabase.from('laudos').update({ valor_servico: e.target.value }).eq('id', id)
        }}
        className="border rounded p-2 w-full mb-4"
      />

      
       <a href={linkWhatsapp}
        target="_blank"
        className="block text-center bg-green-600 text-white font-bold py-3 rounded"
        >
        Enviar Orçamento no WhatsApp
        </a>
    </div>
  )
}