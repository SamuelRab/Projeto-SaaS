'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function Cadastro() {
  const router = useRouter()
  const [nomeOficina, setNomeOficina] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function handleCadastro() {
    if (!nomeOficina || !email || !senha) {
      setErro('Preencha todos os campos.')
      return
    }

    setLoading(true)
    setErro('')

    const { data: signUpData, error: erroAuth } = await supabase.auth.signUp({
      email, password: senha
    })

    if (erroAuth) {
      setErro(erroAuth.message)
      setLoading(false)
      return
    }

    const { error: erroOficina } = await supabase.from('oficinas').insert({
      user_id: signUpData.user.id,
      nome: nomeOficina
    })

    setLoading(false)

    if (erroOficina) {
      setErro(erroOficina.message)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-night flex flex-col justify-center px-6">
      <div className="max-w-sm mx-auto w-full">
        <div className="w-8 h-1.5 bg-accent rounded-full mb-8" />
        <h1 className="font-display text-4xl text-white mb-1">Cadastrar oficina</h1>
        <p className="text-muted text-sm mb-8">Crie sua conta e comece a gerar laudos hoje.</p>

        <label className="block text-sm text-muted mb-1.5">Nome da oficina</label>
        <input
          value={nomeOficina}
          onChange={(e) => setNomeOficina(e.target.value)}
          className="w-full bg-surface border border-line rounded-lg px-4 py-3 mb-4 text-white outline-none focus:border-accent transition-colors"
          placeholder="Estética do Zé"
        />

        <label className="block text-sm text-muted mb-1.5">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-surface border border-line rounded-lg px-4 py-3 mb-4 text-white outline-none focus:border-accent transition-colors"
          placeholder="voce@oficina.com"
        />

        <label className="block text-sm text-muted mb-1.5">Senha</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full bg-surface border border-line rounded-lg px-4 py-3 mb-2 text-white outline-none focus:border-accent transition-colors"
          placeholder="Crie uma senha"
        />

        {erro && <p className="text-accent text-sm mt-2">{erro}</p>}

        <button
          onClick={handleCadastro}
          disabled={loading}
          className="w-full bg-accent hover:bg-accent-dark disabled:opacity-60 transition-colors text-white font-semibold py-3.5 rounded-lg mt-6"
        >
          {loading ? 'Criando conta...' : 'Criar minha conta'}
        </button>

        <p className="text-center text-muted text-sm mt-6">
          Já tem conta?{' '}
          <Link href="/login" className="text-accent hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}