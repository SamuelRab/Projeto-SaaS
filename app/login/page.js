'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setErro('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    setLoading(false)

    if (error) {
      setErro('Email ou senha inválidos.')
      return
    }
    router.push('/dashboard')
  }

  return (
    <div className="p-6 max-w-sm mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-6 text-center">Entrar</h1>

      <input
        type="email"
        placeholder="seu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border rounded p-2 w-full mb-3"
      />
      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        className="border rounded p-2 w-full mb-4"
      />

      {erro && <p className="text-red-600 text-sm mb-3">{erro}</p>}

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-blue-600 text-white font-bold py-3 rounded"
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </div>
  )
}