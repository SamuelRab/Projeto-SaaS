'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
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

  if (!laudo) {
    return (
      <div className="min-h-screen bg-night flex items-center justify-center">
        <p className="text-muted">Carregando laudo...</p>
      </div>
    )
  }

  const linkOrcamento = `${window.location.origin}/orcamento/${laudo.id}`
  const textoMsg = `Olá! Segue o laudo do seu veículo placa ${laudo.placa || ''}:\n\n${laudo.descricao_laudo}\n\n💰 Valor: R$ ${laudo.valor_servico}\n\nVeja fotos e aprove aqui: ${linkOrcamento}`
  const linkWhatsapp = `https://wa.me/${laudo.whatsapp_cliente}?text=${encodeURIComponent(textoMsg)}`

  return (
    <div className="min-h-screen bg-night">
      <div className="border-b border-line px-6 py-6">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-muted hover:text-white transition-colors">←</Link>
          <div>
            <div className="w-6 h-1 bg-accent rounded-full mb-2" />
            <h1 className="font-display text-3xl text-white leading-none">Laudo gerado</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6 pb-16">
        <div className="flex items-center justify-between mb-5">
          <p className="font-mono text-xl text-white tracking-wide">{laudo.placa || 'não identificada'}</p>
          <span className={`text-xs px-2.5 py-1 rounded-full ${laudo.status === 'aprovado' ? 'bg-ok/15 text-ok' : 'bg-warn/15 text-warn'}`}>
            {laudo.status === 'aprovado' ? 'Aprovado' : laudo.status}
          </span>
        </div>

        <img src={laudo.foto_placa_url} className="w-full rounded-lg mb-2 border border-line" />
        <div className="grid grid-cols-2 gap-2 mb-5">
          {laudo.fotos_avarias.map((url, i) => (
            <img key={i} src={url} className="w-full rounded-lg border border-line" />
          ))}
        </div>

        <p className="bg-surface border border-line rounded-lg p-4 mb-5 text-sm text-gray-200 leading-relaxed">
          {laudo.descricao_laudo}
        </p>

        <label className="block text-sm text-muted mb-2">Valor do serviço</label>
        <input
          type="number"
          defaultValue={laudo.valor_servico}
          onBlur={async (e) => {
            await supabase.from('laudos').update({ valor_servico: e.target.value }).eq('id', id)
          }}
          className="w-full bg-surface border border-line rounded-lg px-4 py-3.5 mb-6 text-white outline-none focus:border-accent transition-colors"
        />

        
          <a href={linkWhatsapp}
          target="_blank"
          className="block text-center bg-accent hover:bg-accent-dark transition-colors text-white font-semibold py-4 rounded-lg"
        >
          Enviar orçamento no WhatsApp
        </a>
      </div>
    </div>
  )
}