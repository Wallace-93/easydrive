"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import Link from "next/link"
import { Car, Eye, Lock, Star, Gamepad2 } from "lucide-react"

export default function Simulation() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    createClient().auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-background)" }}>
        <svg className="animate-spin" style={{ color: "var(--color-primary)", width: 32, height: 32 }} fill="none" viewBox="0 0 24 24">
          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--color-background)" }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ background: "var(--color-primary-light)" }}>
          <Lock size={28} style={{ color: "var(--color-primary)" }} />
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>Espace réservé aux membres</h1>
        <p className="text-sm mb-8 text-center max-w-md" style={{ color: "var(--color-text-secondary)" }}>
          Créez un compte gratuit pour accéder aux simulations de conduite et vous entraîner de manière ludique.
        </p>
        <div className="flex gap-3">
          <Link href="/inscription" className="btn-primary" style={{ textDecoration: "none" }}>Créer un compte</Link>
          <Link href="/connexion" className="text-sm font-semibold px-6 py-3 rounded-xl"
            style={{ background: "var(--color-surface)", border: "1.5px solid var(--color-border)", color: "var(--color-text)", textDecoration: "none" }}>
            Se connecter
          </Link>
        </div>
      </div>
    )
  }

  const simulations = [
    {
      id: "manoeuvres",
      titre: "Simulateur de manœuvres",
      description: "Entraînez-vous aux manœuvres du permis : créneau, bataille, épi, demi-tour, marche arrière. Contrôlez votre véhicule en vue de dessus et garez-vous sans accrochage.",
      icon: <Car size={28} />,
      niveaux: "6 manœuvres",
      difficulte: "Progressif",
      href: "/simulation/manoeuvres",
    },
    {
      id: "conduite",
      titre: "Simulation de conduite",
      description: "Prenez des décisions en temps réel face à des situations de circulation : priorités, piétons, feux, signalisation. Testez vos réflexes et votre connaissance du code.",
      icon: <Eye size={28} />,
      niveaux: "12 scénarios",
      difficulte: "3 niveaux",
      href: "/simulation/conduite",
    },
  ]

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      <header className="border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-1" style={{ fontFamily: "var(--font-display)", textDecoration: "none" }}>
            <span className="text-xl font-extrabold" style={{ color: "var(--color-primary)" }}>Just</span>
            <span className="text-xl font-light" style={{ color: "var(--color-text)" }}>Conduite</span>
          </Link>
          <Link href="/dashboard" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>← Tableau de bord</Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-semibold"
            style={{ background: "var(--color-primary-light)", color: "var(--color-primary-dark)" }}>
            <Gamepad2 size={14} /> Zone simulation
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-3" style={{ fontFamily: "var(--font-display)" }}>
            Entraînez-vous en jouant
          </h1>
          <p className="text-sm max-w-lg mx-auto" style={{ color: "var(--color-text-secondary)" }}>
            Des simulations interactives pour vous préparer aux situations réelles de conduite. Progressez à votre rythme, sans stress.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {simulations.map(sim => (
            <Link key={sim.id} href={sim.href} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="rounded-2xl p-6 h-full transition-all"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--color-primary)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,179,125,0.12)" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.boxShadow = "none" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>
                  {sim.icon}
                </div>
                <h2 className="text-lg font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>{sim.titre}</h2>
                <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>{sim.description}</p>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "var(--color-primary-light)", color: "var(--color-primary-dark)" }}>
                    {sim.niveaux}
                  </span>
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{sim.difficulte}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
