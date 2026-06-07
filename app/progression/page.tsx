"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import { THEMES } from "@/data/questions-code"
import Link from "next/link"

type Badge = {
  id: string
  label: string
  icon: string
  description: string
  obtenu: boolean
}

export default function Progression() {
  const [loading, setLoading] = useState(true)
  const [profil, setProfil] = useState<any>(null)
  const [nbLecons, setNbLecons] = useState(0)
  const [nbLeconsTerminees, setNbLeconsTerminees] = useState(0)
  const [scoreCode, setScoreCode] = useState(0)
  const [questionsRepondues, setQuestionsRepondues] = useState(0)
  const [badges, setBadges] = useState<Badge[]>([])
  const [scoreGlobal, setScoreGlobal] = useState(0)
  const [streakJours, setStreakJours] = useState(0)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) { window.location.replace("/connexion"); return }

      const { data: profile } = await supabase
        .from("profiles")
        .select("prenom, nom, role")
        .eq("id", session.user.id)
        .single()

      setProfil(profile)

      // Récupérer les réservations
      const { data: eleve } = await supabase
        .from("eleves")
        .select("id")
        .eq("user_id", session.user.id)
        .single()

      let lecons = 0
      let leconsTerminees = 0

      if (eleve) {
        const { data: res } = await supabase
          .from("reservations")
          .select("statut")
          .eq("eleve_id", eleve.id)

        if (res) {
          lecons = res.length
          leconsTerminees = res.filter(r => r.statut === "terminee").length
        }
      }

      setNbLecons(lecons)
      setNbLeconsTerminees(leconsTerminees)

      // Récupérer la progression du code
      const saved = localStorage.getItem("easydrive_code_progression")
      let totalQ = 0
      let totalCorrect = 0
      if (saved) {
        try {
          const prog = JSON.parse(saved)
          for (const key of Object.keys(prog)) {
            totalQ += prog[key].total
            totalCorrect += prog[key].correct
          }
        } catch {}
      }

      setQuestionsRepondues(totalQ)
      const pctCode = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0
      setScoreCode(pctCode)

      // Streak
      const lastVisit = localStorage.getItem("easydrive_last_visit")
      const today = new Date().toDateString()
      const streak = parseInt(localStorage.getItem("easydrive_streak") || "0")

      if (lastVisit === today) {
        setStreakJours(streak)
      } else {
        const yesterday = new Date(Date.now() - 86400000).toDateString()
        const newStreak = lastVisit === yesterday ? streak + 1 : 1
        localStorage.setItem("easydrive_streak", newStreak.toString())
        localStorage.setItem("easydrive_last_visit", today)
        setStreakJours(newStreak)
      }

      // Calculer le score global de préparation
      const scoreLecons = Math.min(leconsTerminees * 5, 30) // max 30 pts pour les leçons
      const scoreQuiz = Math.min(Math.round(pctCode * 0.4), 40) // max 40 pts pour le code
      const scoreRegularite = Math.min(totalQ > 20 ? 15 : Math.round((totalQ / 20) * 15), 15) // max 15 pts
      const scoreStreak = Math.min(streak * 3, 15) // max 15 pts
      const total = scoreLecons + scoreQuiz + scoreRegularite + scoreStreak
      setScoreGlobal(Math.min(total, 100))

      // Badges
      const allBadges: Badge[] = [
        { id: "premiere_lecon", label: "Première leçon", icon: "🚗", description: "Réserver votre première leçon de conduite", obtenu: lecons >= 1 },
        { id: "cinq_lecons", label: "Conducteur assidu", icon: "🏆", description: "Compléter 5 leçons de conduite", obtenu: leconsTerminees >= 5 },
        { id: "dix_lecons", label: "Pilote confirmé", icon: "🎯", description: "Compléter 10 leçons de conduite", obtenu: leconsTerminees >= 10 },
        { id: "premiere_serie", label: "Premier quiz", icon: "📝", description: "Compléter votre première série de code", obtenu: totalQ >= 10 },
        { id: "cent_questions", label: "Bûcheur", icon: "📚", description: "Répondre à 100 questions de code", obtenu: totalQ >= 100 },
        { id: "score_80", label: "Bon élève", icon: "⭐", description: "Obtenir 80 % ou plus au code", obtenu: pctCode >= 80 && totalQ >= 20 },
        { id: "score_90", label: "Expert du code", icon: "🌟", description: "Obtenir 90 % ou plus au code", obtenu: pctCode >= 90 && totalQ >= 30 },
        { id: "streak_3", label: "Régulier", icon: "🔥", description: "Réviser 3 jours consécutifs", obtenu: streak >= 3 },
        { id: "streak_7", label: "Semaine parfaite", icon: "💎", description: "Réviser 7 jours consécutifs", obtenu: streak >= 7 },
        { id: "premier_avis", label: "Critique auto", icon: "💬", description: "Laisser votre premier avis", obtenu: false },
      ]

      // Vérifier le badge avis
      if (eleve) {
        const { count } = await supabase.from("avis").select("id", { count: "exact", head: true }).eq("eleve_id", eleve.id)
        if (count && count > 0) {
          const idx = allBadges.findIndex(b => b.id === "premier_avis")
          if (idx >= 0) allBadges[idx].obtenu = true
        }
      }

      setBadges(allBadges)
      setLoading(false)
    }
    load()
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

  const badgesObtenus = badges.filter(b => b.obtenu).length

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      <header className="border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-1" style={{ fontFamily: "var(--font-display)", textDecoration: "none" }}>
            <span className="text-xl font-extrabold" style={{ color: "var(--color-primary)" }}>Easy</span>
            <span className="text-xl font-light" style={{ color: "var(--color-text)" }}>Drive</span>
          </Link>
          <Link href="/dashboard" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>← Tableau de bord</Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Ma progression
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--color-text-secondary)" }}>
          Suivez votre avancement vers l'obtention du permis.
        </p>

        {/* Score global */}
        <div className="rounded-2xl p-6 sm:p-8 mb-8 text-center" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <p className="text-sm font-semibold mb-4" style={{ color: "var(--color-text-secondary)" }}>Score de préparation à l'examen</p>
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none" stroke="var(--color-border)" strokeWidth="2.5" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={scoreGlobal >= 75 ? "var(--color-primary)" : scoreGlobal >= 50 ? "#F59E0B" : "var(--color-error)"}
                strokeWidth="2.5" strokeDasharray={`${scoreGlobal}, 100`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold" style={{ fontFamily: "var(--font-display)" }}>{scoreGlobal}</span>
              <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>/ 100</span>
            </div>
          </div>
          <p className="text-base font-semibold" style={{ color: scoreGlobal >= 75 ? "var(--color-primary)" : scoreGlobal >= 50 ? "#F59E0B" : "var(--color-error)" }}>
            {scoreGlobal >= 85 ? "Vous êtes prêt pour l'examen !" : scoreGlobal >= 70 ? "Vous progressez bien, continuez !" : scoreGlobal >= 40 ? "Encore un effort, vous y êtes presque !" : "Commencez à réviser pour progresser."}
          </p>
        </div>

        {/* Détail du score */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Code de la route", value: `${scoreCode}%`, icon: "📝", sub: `${questionsRepondues} questions` },
            { label: "Leçons terminées", value: nbLeconsTerminees.toString(), icon: "🚗", sub: `${nbLeconsTerminees}h de conduite` },
            { label: "Série en cours", value: `${streakJours}j`, icon: "🔥", sub: "jours consécutifs" },
            { label: "Badges obtenus", value: `${badgesObtenus}/${badges.length}`, icon: "🏅", sub: "récompenses" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
              <span className="text-2xl">{s.icon}</span>
              <p className="text-xl font-bold mt-2" style={{ fontFamily: "var(--font-display)" }}>{s.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Actions rapides */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Link href="/code" className="btn-primary text-center block" style={{ textDecoration: "none" }}>
            Réviser le code →
          </Link>
          <Link href="/resultats" className="text-center block text-sm font-semibold px-6 py-3.5 rounded-xl"
            style={{ background: "var(--color-surface)", border: "1.5px solid var(--color-border)", color: "var(--color-text)", textDecoration: "none" }}>
            Réserver une leçon →
          </Link>
        </div>

        {/* Badges */}
        <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
          Badges <span className="text-sm font-normal" style={{ color: "var(--color-text-muted)" }}>({badgesObtenus}/{badges.length})</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {badges.map(b => (
            <div key={b.id} className="rounded-xl p-4 text-center transition-all"
              style={{
                background: b.obtenu ? "var(--color-primary-light)" : "var(--color-surface)",
                border: `1px solid ${b.obtenu ? "var(--color-primary)" : "var(--color-border)"}`,
                opacity: b.obtenu ? 1 : 0.5,
              }}>
              <span className="text-2xl">{b.icon}</span>
              <p className="text-xs font-bold mt-2" style={{ color: b.obtenu ? "var(--color-primary-dark)" : "var(--color-text-secondary)" }}>
                {b.label}
              </p>
              <p className="text-[10px] mt-1" style={{ color: "var(--color-text-muted)" }}>{b.description}</p>
            </div>
          ))}
        </div>

        {/* Progression code par thème */}
        <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>Progression par thème</h2>
        <div className="rounded-2xl p-5" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          {THEMES.map(theme => {
            const saved = localStorage.getItem("easydrive_code_progression")
            let pct = 0
            if (saved) {
              try {
                const prog = JSON.parse(saved)
                if (prog[theme.id] && prog[theme.id].total > 0) {
                  pct = Math.round((prog[theme.id].correct / prog[theme.id].total) * 100)
                }
              } catch {}
            }

            return (
              <div key={theme.id} className="flex items-center gap-3 py-2.5" style={{ borderBottom: "1px solid var(--color-border)" }}>
                <span className="text-lg">{theme.icon}</span>
                <span className="text-sm font-medium flex-1">{theme.label}</span>
                <div className="w-24 h-2 rounded-full" style={{ background: "var(--color-border)" }}>
                  <div className="h-2 rounded-full transition-all" style={{
                    width: `${pct}%`,
                    background: pct >= 75 ? "var(--color-primary)" : pct >= 50 ? "#F59E0B" : pct > 0 ? "var(--color-error)" : "var(--color-border)",
                  }} />
                </div>
                <span className="text-xs font-bold w-10 text-right" style={{ color: pct >= 75 ? "var(--color-primary)" : "var(--color-text-muted)" }}>
                  {pct > 0 ? `${pct}%` : "—"}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
