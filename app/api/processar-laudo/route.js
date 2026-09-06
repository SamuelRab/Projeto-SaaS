import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function imagemParaBase64(url) {
  const resp = await fetch(url)
  const buffer = await resp.arrayBuffer()
  return Buffer.from(buffer).toString('base64')
}

export async function POST(req) {
  try {
    const { laudoId } = await req.json()

    // Busca o laudo no banco
    const { data: laudo, error: erroBusca } = await supabaseAdmin
      .from('laudos')
      .select('*')
      .eq('id', laudoId)
      .single()

    if (erroBusca) throw erroBusca

    // Converte as imagens em base64 pra mandar pro Gemini
    const placaBase64 = await imagemParaBase64(laudo.foto_placa_url)
    const avariasBase64 = await Promise.all(
      laudo.fotos_avarias.map(imagemParaBase64)
    )

    const partesImagens = [
      { inline_data: { mime_type: 'image/jpeg', data: placaBase64 } },
      ...avariasBase64.map(b64 => ({
        inline_data: { mime_type: 'image/jpeg', data: b64 }
      }))
    ]

    const prompt = `
Você é o assistente de uma estética automotiva.
Analise as imagens fornecidas:
- A primeira imagem é a placa do veículo. Extraia o número da placa (formato brasileiro, ex: ABC1D23 ou ABC1234).
- As imagens seguintes mostram avarias/defeitos estéticos do veículo (arranhões, manchas, riscos, oxidação, etc).

Responda SOMENTE em JSON válido, sem markdown, no formato exato:
{
  "placa": "string com a placa identificada, ou null se não conseguir ler",
  "descricao_laudo": "texto comercial e profissional descrevendo os defeitos encontrados e recomendando um serviço de estética automotiva adequado (polimento, vitrificação, higienização, etc), em 2 a 4 frases, tom persuasivo mas honesto",
  "valor_sugerido": numero (estimativa em reais do serviço recomendado, baseado na gravidade, entre 150 e 900)
}
`

    const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }, ...partesImagens] }]
        })
      }
    )

   const dataIA = await resp.json()

if (!resp.ok || !dataIA.candidates) {
  console.error('Erro da API Gemini:', JSON.stringify(dataIA))
  throw new Error('Gemini API error: ' + JSON.stringify(dataIA.error || dataIA))
}

let textoResposta = dataIA.candidates[0].content.parts[0].text

    // Limpa possíveis blocos de markdown que o modelo às vezes manda
    textoResposta = textoResposta.replace(/```json|```/g, '').trim()
    const resultado = JSON.parse(textoResposta)

    // Atualiza o laudo no banco com os dados da IA
    const { error: erroUpdate } = await supabaseAdmin
      .from('laudos')
      .update({
        placa: resultado.placa,
        descricao_laudo: resultado.descricao_laudo,
        valor_servico: resultado.valor_sugerido,
        status: 'aguardando'
      })
      .eq('id', laudoId)

    if (erroUpdate) throw erroUpdate

    return Response.json({ sucesso: true, resultado })

  } catch (err) {
    console.error(err)
    return Response.json({ sucesso: false, erro: err.message }, { status: 500 })
  }
}