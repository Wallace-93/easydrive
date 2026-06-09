"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import { THEMES, QUESTIONS } from "@/data/questions-code"
import Link from "next/link"
import { TrafficCone, Eye, Route, Users, FileText, Heart, CarFront, Wrench, Shield, Leaf } from "lucide-react"

function ThemeIcon({ iconKey }: { iconKey: string }) {
  const Icon = THEME_ICONS[iconKey] || FileText
  return (
    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>
      <Icon size={20} />
    </div>
  )
}

const THEME_ICONS: Record<string, any> = {
  circulation: TrafficCone,
  conducteur: Eye,
  route: Route,
  usagers: Users,
  notions: FileText,
  secours: Heart,
  vehicule: CarFront,
  mecanique: Wrench,
  securite: Shield,
  environnement: Leaf,
}

type Progression = Record<string, { total: number; correct: number }>

export default function CodePage() {
  const [user, setUser] = useState<any>(null)
  const [progression, setProgression] = useState<Progression>({})

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })

    // Charger la progression depuis localStorage
    const saved = localStorage.getItem("justconduite_code_progression")
    if (saved) {
      try { setProgression(JSON.parse(saved)) } catch {}
    }
  }, [])

  const totalQuestions = QUESTIONS.length
  const totalRepondues = Object.values(progression).reduce((s, p) => s + p.total, 0)
  const totalCorrectes = Object.values(progression).reduce((s, p) => s + p.correct, 0)
  const pourcentage = totalRepondues > 0 ? Math.round((totalCorrectes / totalRepondues) * 100) : 0

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      <header className="border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-1" style={{ fontFamily: "var(--font-display)", textDecoration: "none" }}>
            <span className="text-xl font-extrabold" style={{ color: "var(--color-primary)" }}>Just</span>
            <span className="text-xl font-light" style={{ color: "var(--color-text)" }}>Conduite</span>
          </Link>
          {user ? (
            <Link href="/dashboard" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>← Tableau de bord</Link>
          ) : (
            <Link href="/inscription" className="btn-primary text-sm" style={{ textDecoration: "none", padding: "10px 20px" }}>S'inscrire</Link>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-semibold"
            style={{ background: "var(--color-primary-light)", color: "var(--color-primary-dark)" }}>
            🎓 100 % gratuit
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-3" style={{ fontFamily: "var(--font-display)" }}>
            Code de la route
          </h1>
          <p className="text-sm max-w-lg mx-auto" style={{ color: "var(--color-text-secondary)" }}>
            {totalQuestions} questions réparties en {THEMES.length} thèmes officiels. Entraînez-vous gratuitement et suivez votre progression.
          </p>
        </div>

        {/* Statistiques globales */}
        {totalRepondues > 0 && (
          <div className="rounded-2xl p-6 mb-8" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-sm font-semibold">Votre progression globale</p>
                <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                  {totalCorrectes} bonnes réponses sur {totalRepondues} questions
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="var(--color-border)" strokeWidth="3" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke={pourcentage >= 75 ? "var(--color-primary)" : pourcentage >= 50 ? "#F59E0B" : "var(--color-error)"}
                      strokeWidth="3" strokeDasharray={`${pourcentage}, 100`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{pourcentage}%</span>
                </div>
                <div className="text-sm">
                  <p style={{ color: pourcentage >= 75 ? "var(--color-primary)" : pourcentage >= 50 ? "#F59E0B" : "var(--color-error)" }}>
                    {pourcentage >= 87 ? "Prêt pour l'examen !" : pourcentage >= 75 ? "Bon niveau" : pourcentage >= 50 ? "En progression" : "Continuez à réviser"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modes de quiz */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <Link href="/code/quiz?mode=examen" style={{ textDecoration: "none" }}>
            <div className="rounded-2xl p-6 transition-all" style={{ background: "linear-gradient(135deg, var(--color-primary), #009966)", border: "none" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,179,125,0.3)" }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none" }}>
              <p className="text-lg font-bold" style={{ color: "white" }}>📝 Examen blanc</p>
              <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.8)" }}>40 questions — conditions réelles</p>
            </div>
          </Link>
          <Link href="/code/quiz?mode=rapide" style={{ textDecoration: "none" }}>
            <div className="rounded-2xl p-6 transition-all" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--color-primary)" }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-border)" }}>
              <p className="text-lg font-bold">⚡ Série rapide</p>
              <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>10 questions — tous thèmes</p>
            </div>
          </Link>
        </div>

        {/* Thèmes */}
        <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>Par thème</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {THEMES.map(theme => {
            const nbQuestions = QUESTIONS.filter(q => q.theme === theme.id).length
            const prog = progression[theme.id]
            const pct = prog && prog.total > 0 ? Math.round((prog.correct / prog.total) * 100) : null

            return (
              <Link key={theme.id} href={`/code/quiz?theme=${theme.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="rounded-xl p-4 flex items-center gap-4 transition-all"
                  style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--color-border)")}>
                  <ThemeIcon iconKey={theme.icon} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{theme.label}</p>
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {nbQuestions} questions
                      {pct !== null && <span> · <span style={{ color: pct >= 75 ? "var(--color-primary)" : pct >= 50 ? "#F59E0B" : "var(--color-error)" }}>{pct}%</span></span>}
                    </p>
                  </div>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--color-text-muted)" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Réinitialiser */}
        {totalRepondues > 0 && (
          <div className="text-center mt-8">
            <button onClick={() => { localStorage.removeItem("justconduite_code_progression"); setProgression({}); }}
              className="text-xs font-medium" style={{ color: "var(--color-text-muted)", background: "none", border: "none", cursor: "pointer" }}>
              Réinitialiser ma progression
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
