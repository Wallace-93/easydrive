"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { QUESTIONS, THEMES, type Question } from "@/data/questions-code"
import Link from "next/link"

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function QuizContent() {
  const searchParams = useSearchParams()
  const theme = searchParams.get("theme")
  const mode = searchParams.get("mode")

  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    let pool: Question[]

    if (theme) {
      pool = shuffleArray(QUESTIONS.filter(q => q.theme === theme))
    } else if (mode === "examen") {
      pool = shuffleArray(QUESTIONS).slice(0, 40)
    } else {
      pool = shuffleArray(QUESTIONS).slice(0, 10)
    }

    setQuestions(pool)
  }, [theme, mode])

  function repondre(choix: number) {
    if (answered) return
    setSelected(choix)
    setAnswered(true)

    const correct = questions[index].correctes.includes(choix)
    if (correct) setScore(prev => prev + 1)
  }

  function suivante() {
    if (index + 1 >= questions.length) {
      // Sauvegarder la progression
      const themeId = theme || "mixte"
      const saved = localStorage.getItem("easydrive_code_progression")
      const progression = saved ? JSON.parse(saved) : {}

      if (!progression[themeId]) progression[themeId] = { total: 0, correct: 0 }
      progression[themeId].total += questions.length
      progression[themeId].correct += score + (questions[index].correctes.includes(selected!) ? 0 : 0)

      // Recalculer le score final
      const finalScore = score
      progression[themeId] = {
        total: (progression[themeId]?.total || 0) + questions.length,
        correct: (progression[themeId]?.correct || 0) + finalScore,
      }

      // Si c'est un quiz thématique, mettre à jour uniquement ce thème
      if (theme) {
        const existant = saved ? JSON.parse(saved) : {}
        if (!existant[theme]) existant[theme] = { total: 0, correct: 0 }
        existant[theme].total += questions.length
        existant[theme].correct += finalScore
        localStorage.setItem("easydrive_code_progression", JSON.stringify(existant))
      } else {
        localStorage.setItem("easydrive_code_progression", JSON.stringify(progression))
      }

      setFinished(true)
    } else {
      setIndex(prev => prev + 1)
      setSelected(null)
      setAnswered(false)
    }
  }

  const titre = theme
    ? THEMES.find(t => t.id === theme)?.label || "Quiz"
    : mode === "examen"
    ? "Examen blanc"
    : "Série rapide"

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-background)" }}>
        <svg className="animate-spin" style={{ color: "var(--color-primary)", width: 32, height: 32 }} fill="none" viewBox="0 0 24 24">
          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  if (finished) {
    const pourcentage = Math.round((score / questions.length) * 100)
    const reussi = mode === "examen" ? score >= 35 : pourcentage >= 75

    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--color-background)" }}>
        <div className="w-full max-w-md text-center animate-in">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl"
            style={{ background: reussi ? "var(--color-primary-light)" : "var(--color-error-light)" }}>
            {reussi ? "🎉" : "💪"}
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
            {reussi ? "Bravo !" : "Continuez vos efforts !"}
          </h1>
          <p className="text-4xl font-extrabold my-4" style={{ fontFamily: "var(--font-display)", color: reussi ? "var(--color-primary)" : "var(--color-error)" }}>
            {score}/{questions.length}
          </p>
          <p className="text-sm mb-2" style={{ color: "var(--color-text-secondary)" }}>
            {pourcentage}% de bonnes réponses
          </p>
          {mode === "examen" && (
            <p className="text-sm mb-8" style={{ color: reussi ? "var(--color-primary)" : "var(--color-error)" }}>
              {reussi ? "Vous auriez obtenu votre code !" : `Il faut 35/40 pour réussir. Il vous manque ${35 - score} bonne${35 - score > 1 ? "s" : ""} réponse${35 - score > 1 ? "s" : ""}.`}
            </p>
          )}

          <div className="flex flex-col gap-3 mt-6">
            <button onClick={() => { setIndex(0); setScore(0); setSelected(null); setAnswered(false); setFinished(false); setQuestions(shuffleArray(questions)) }}
              className="btn-primary w-full">
              Recommencer
            </button>
            <Link href="/code" className="text-sm font-semibold px-6 py-3 rounded-xl text-center block"
              style={{ background: "var(--color-surface-hover)", color: "var(--color-text-secondary)", textDecoration: "none" }}>
              Choisir un autre thème
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const q = questions[index]
  const isCorrect = selected !== null && q.correctes.includes(selected)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-background)" }}>
      <header className="border-b flex-shrink-0" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/code" className="text-sm font-medium flex items-center gap-1" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Quitter
          </Link>
          <span className="text-sm font-semibold">{titre}</span>
          <span className="text-sm font-bold" style={{ color: "var(--color-primary)" }}>{index + 1}/{questions.length}</span>
        </div>
        {/* Barre de progression */}
        <div className="h-1" style={{ background: "var(--color-border)" }}>
          <div className="h-1 transition-all duration-300" style={{ background: "var(--color-primary)", width: `${((index + 1) / questions.length) * 100}%` }} />
        </div>
      </header>

      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-8">
        {/* Question */}
        <div className="mb-8">
          <p className="text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
            Question {index + 1} sur {questions.length}
          </p>
          <h2 className="text-lg sm:text-xl font-bold leading-snug" style={{ fontFamily: "var(--font-display)" }}>
            {q.question}
          </h2>
        </div>

        {/* Réponses */}
        <div className="flex flex-col gap-3 flex-1">
          {q.reponses.map((reponse, i) => {
            let bg = "var(--color-surface)"
            let borderColor = "var(--color-border)"
            let textColor = "var(--color-text)"

            if (answered) {
              if (q.correctes.includes(i)) {
                bg = "var(--color-success-light)"
                borderColor = "var(--color-primary)"
                textColor = "var(--color-primary-dark)"
              } else if (selected === i) {
                bg = "var(--color-error-light)"
                borderColor = "var(--color-error)"
                textColor = "var(--color-error)"
              }
            } else if (selected === i) {
              borderColor = "var(--color-primary)"
            }

            return (
              <button key={i} onClick={() => repondre(i)} disabled={answered}
                className="text-left p-4 rounded-xl transition-all flex items-start gap-3"
                style={{ background: bg, border: `1.5px solid ${borderColor}`, color: textColor, cursor: answered ? "default" : "pointer" }}>
                <span className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{
                    background: answered && q.correctes.includes(i) ? "var(--color-primary)" : answered && selected === i ? "var(--color-error)" : "var(--color-surface-hover)",
                    color: answered && (q.correctes.includes(i) || selected === i) ? "white" : "var(--color-text-secondary)",
                  }}>
                  {answered && q.correctes.includes(i) ? "✓" : answered && selected === i ? "✕" : String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm font-medium pt-0.5">{reponse}</span>
              </button>
            )
          })}
        </div>

        {/* Explication */}
        {answered && (
          <div className="mt-6 animate-in">
            <div className="rounded-xl p-4 mb-4" style={{
              background: isCorrect ? "var(--color-success-light)" : "var(--color-error-light)",
              border: `1px solid ${isCorrect ? "rgba(0,179,125,0.2)" : "rgba(239,68,68,0.2)"}`,
            }}>
              <p className="text-sm font-bold mb-1" style={{ color: isCorrect ? "var(--color-primary-dark)" : "var(--color-error)" }}>
                {isCorrect ? "Bonne réponse !" : "Mauvaise réponse"}
              </p>
              <p className="text-sm" style={{ color: isCorrect ? "var(--color-primary-dark)" : "var(--color-error)" }}>
                {q.explication}
              </p>
            </div>
            <button onClick={suivante} className="btn-primary w-full">
              {index + 1 >= questions.length ? "Voir les résultats" : "Question suivante →"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-background)" }}>
        <svg className="animate-spin" style={{ color: "var(--color-primary)", width: 32, height: 32 }} fill="none" viewBox="0 0 24 24">
          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    }>
      <QuizContent />
    </Suspense>
  )
}
