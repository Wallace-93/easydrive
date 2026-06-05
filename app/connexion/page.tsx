"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase-client"

export default function Connexion() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin() {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError("Adresse e-mail ou mot de passe incorrect.")
      setLoading(false)
      return
    }

    if (data.session) {
      await new Promise(r => setTimeout(r, 500))
      window.location.replace("/dashboard")
    } else {
      setError("La connexion a échoué. Veuillez réessayer.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-background)" }}>
      <header className="border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-1" style={{ fontFamily: "var(--font-display)", textDecoration: "none" }}>
            <span className="text-xl font-extrabold" style={{ color: "var(--color-primary)" }}>Easy</span>
            <span className="text-xl font-light" style={{ color: "var(--color-text)" }}>Drive</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>Bon retour !</h1>
          <p className="text-sm mb-8" style={{ color: "var(--color-text-secondary)" }}>Connectez-vous à votre compte Easy Drive.</p>

          <div className="rounded-2xl p-6 sm:p-8 flex flex-col gap-5" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Adresse e-mail</label>
              <input
                type="email" placeholder="jean.dupont@email.com" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Mot de passe</label>
              <input
                type="password" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                className="input-field"
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl text-sm" style={{ background: "var(--color-error-light)", color: "var(--color-error)" }}>
                {error}
              </div>
            )}

            <button type="button" onClick={handleLogin} disabled={loading} className="btn-primary w-full">
              {loading ? "Connexion…" : "Se connecter"}
            </button>

            <p className="text-center text-sm pt-4 border-t" style={{ color: "var(--color-text-muted)", borderColor: "var(--color-border)" }}>
              Pas encore de compte ?{" "}
              <Link href="/inscription" className="font-semibold" style={{ color: "var(--color-primary)", textDecoration: "none" }}>
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
