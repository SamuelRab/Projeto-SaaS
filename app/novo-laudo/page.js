'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function NovoLaudo() {
  const router = useRouter()
  const [fotoPlaca, setFotoPlaca] = useState(null)
  const [fotosAvarias, setFotosAvarias] = useState([])
  const [whatsapp, setWhatsapp] = useState('')
  const [loading, setLoading] = useState(false)

  async function uploadFoto(file, pasta) {
    const nomeArquivo = `${pasta}/${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from('fotos-laudos')
      .upload(nomeArquivo, file)

    if (error) throw error

    const { data: urlData } = supabase.storage
      .from('fotos-laudos')
      .getPublicUrl(nomeArquivo)

    return urlData.publicUrl
  }

  async function handleSalvar() {
    if (!fotoPlaca || fotosAvarias.length === 0 || !whatsapp) {
      alert('Preencha a foto da placa, ao menos 1 foto de avaria e o WhatsApp.')
      return
    }

    setLoading(true)
    try {
      // 1. Upload das fotos
      const urlPlaca = await uploadFoto(fotoPlaca, 'placas')
      const urlsAvarias = []
      for (const foto of fotosAvarias) {
        const url = await uploadFoto(foto, 'avarias')
        urlsAvarias.push(url)
      }

      // 2. Cria o registro inicial no banco
      const { data: laudo, error } = await supabase
        .from('laudos')
        .insert({
          whatsapp_cliente: whatsapp,
          foto_placa_url: urlPlaca,
          fotos_avarias: urlsAvarias,
          status: 'processando'
        })
        .select()
        .single()

      if (error) throw error

      // 3. Chama a rota de IA para processar (Passo 3)
      const resp = await fetch('/api/processar-laudo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ laudoId: laudo.id })
      })

      if (!resp.ok) throw new Error('Erro ao processar com IA')

      // 4. Redireciona pro laudo pronto (tela de revisão do funcionário)
      router.push(`/laudo/${laudo.id}`)

    } catch (err) {
      console.error(err)
      alert('Erro: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Novo Laudo</h1>

      <label className="block mb-2 font-medium">📸 Foto da placa</label>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => setFotoPlaca(e.target.files[0])}
        className="mb-4 block w-full"
      />

      <label className="block mb-2 font-medium">📸 Fotos das avarias (pode selecionar várias)</label>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={(e) => setFotosAvarias(Array.from(e.target.files))}
        className="mb-4 block w-full"
      />

      <label className="block mb-2 font-medium">📱 WhatsApp do cliente</label>
      <input
        type="tel"
        placeholder="5511999999999"
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
        className="mb-6 block w-full border rounded p-2"
      />

      <button
        onClick={handleSalvar}
        disabled={loading}
        className="w-full bg-green-600 text-white font-bold py-3 rounded"
      >
        {loading ? 'Processando com IA...' : 'Salvar e Gerar Laudo'}
      </button>
    </div>
  )
}