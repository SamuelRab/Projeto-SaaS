'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/protegerPagina'

export default function NovoLaudo() {
  const router = useRouter()
  const { usuario, oficinaId, carregando } = useAuth()
  const [fotoPlaca, setFotoPlaca] = useState(null)
  const [fotosAvarias, setFotosAvarias] = useState([])
  const [whatsapp, setWhatsapp] = useState('')
  const [loading, setLoading] = useState(false)

  async function uploadFoto(file, pasta) {
    const nomeArquivo = `${pasta}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('fotos-laudos').upload(nomeArquivo, file)
    if (error) throw error
    const { data: urlData } = supabase.storage.from('fotos-laudos').getPublicUrl(nomeArquivo)
    return urlData.publicUrl
  }

  async function handleSalvar() {
    if (!fotoPlaca || fotosAvarias.length === 0 || !whatsapp) {
      alert('Preencha a foto da placa, ao menos 1 foto de avaria e o WhatsApp.')
      return
    }
    if (!oficinaId) {
      alert('Não foi possível identificar sua oficina. Faça login novamente.')
      return
    }

    setLoading(true)
    try {
      const urlPlaca = await uploadFoto(fotoPlaca, 'placas')
      const urlsAvarias = []
      for (const foto of fotosAvarias) {
        urlsAvarias.push(await uploadFoto(foto, 'avarias'))
      }

      const { data: laudo, error } = await supabase
        .from('laudos')
        .insert({
          whatsapp_cliente: whatsapp,
          foto_placa_url: urlPlaca,
          fotos_avarias: urlsAvarias,
          status: 'processando',
          oficina_id: oficinaId
        })
        .select()
        .single()

      if (error) throw error

      const resp = await fetch('/api/processar-laudo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ laudoId: laudo.id })
      })

      if (!resp.ok) throw new Error('Erro ao processar com IA')

      router.push(`/laudo/${laudo.id}`)
    } catch (err) {
      console.error(err)
      alert('Erro: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-night flex items-center justify-center">
        <p className="text-muted">Carregando...</p>
      </div>
    )
  }
  if (!usuario) return null

  return (
    <div className="min-h-screen bg-night">
      <div className="border-b border-line px-6 py-6">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Link href="/dashboard" className="text-muted hover:text-white transition-colors">←</Link>
          <div>
            <div className="w-6 h-1 bg-accent rounded-full mb-2" />
            <h1 className="font-display text-3xl text-white leading-none">Novo laudo</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6 pb-16">
        <label className="block text-sm text-muted mb-2">Foto da placa</label>
        <label className="flex items-center justify-between bg-surface border border-line hover:border-accent/50 transition-colors rounded-lg px-4 py-3.5 mb-5 cursor-pointer">
          <span className="text-white text-sm">{fotoPlaca ? fotoPlaca.name : 'Tirar foto da placa'}</span>
          <span className="text-accent text-sm">Câmera</span>
          <input
            type="file" accept="image/*" capture="environment"
            onChange={(e) => setFotoPlaca(e.target.files[0])}
            className="hidden"
          />
        </label>

        <label className="block text-sm text-muted mb-2">Fotos das avarias</label>
        <label className="flex items-center justify-between bg-surface border border-line hover:border-accent/50 transition-colors rounded-lg px-4 py-3.5 mb-5 cursor-pointer">
          <span className="text-white text-sm">
            {fotosAvarias.length > 0 ? `${fotosAvarias.length} foto(s) selecionada(s)` : 'Fotografar avarias'}
          </span>
          <span className="text-accent text-sm">Câmera</span>
          <input
            type="file" accept="image/*" capture="environment" multiple
            onChange={(e) => setFotosAvarias(Array.from(e.target.files))}
            className="hidden"
          />
        </label>

        <label className="block text-sm text-muted mb-2">WhatsApp do cliente</label>
        <input
          type="tel"
          placeholder="5511999999999"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          className="w-full bg-surface border border-line rounded-lg px-4 py-3.5 mb-8 text-white outline-none focus:border-accent transition-colors"
        />

        <button
          onClick={handleSalvar}
          disabled={loading}
          className="w-full bg-accent hover:bg-accent-dark disabled:opacity-60 transition-colors text-white font-semibold py-4 rounded-lg"
        >
          {loading ? 'Processando o laudo...' : 'Gerar laudo'}
        </button>
      </div>
    </div>
  )
}