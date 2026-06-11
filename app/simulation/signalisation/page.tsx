"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import Link from "next/link"
import { ChevronLeft, Trophy, RefreshCw, Eye } from "lucide-react"

type Panneau = {
  id: string
  nom: string
  svg: (size: number) => JSX.Element
  reponseCorrecte: string
  options: string[]
  categorie: "interdiction" | "danger" | "obligation" | "indication" | "priorite"
}

function PanneauSVG({ type, size }: { type: string; size: number }) {
  const s = size
  const c = s / 2

  switch (type) {
    case "sens_interdit":
      return <svg viewBox="0 0 100 100" width={s} height={s}><circle cx="50" cy="50" r="45" fill="#E53935" stroke="#B71C1C" strokeWidth="3"/><rect x="15" y="42" width="70" height="16" rx="3" fill="#FFF"/></svg>
    case "stop":
      return <svg viewBox="0 0 100 100" width={s} height={s}><polygon points="50,5 95,27 95,73 50,95 5,73 5,27" fill="#E53935" stroke="#B71C1C" strokeWidth="3"/><text x="50" y="58" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#FFF">STOP</text></svg>
    case "interdit_tourner_gauche":
      return <svg viewBox="0 0 100 100" width={s} height={s}><circle cx="50" cy="50" r="45" fill="#FFF" stroke="#E53935" strokeWidth="8"/><path d="M55 70 L55 40 L35 40" fill="none" stroke="#333" strokeWidth="6" strokeLinecap="round"/><path d="M45 30 L35 40 L45 50" fill="none" stroke="#333" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/><line x1="20" y1="80" x2="80" y2="20" stroke="#E53935" strokeWidth="8"/></svg>
    case "interdit_depasser":
      return <svg viewBox="0 0 100 100" width={s} height={s}><circle cx="50" cy="50" r="45" fill="#FFF" stroke="#E53935" strokeWidth="8"/><rect x="22" y="35" width="18" height="30" rx="6" fill="#333"/><rect x="55" y="35" width="18" height="30" rx="6" fill="#E53935"/></svg>
    case "limitation_30":
      return <svg viewBox="0 0 100 100" width={s} height={s}><circle cx="50" cy="50" r="45" fill="#FFF" stroke="#E53935" strokeWidth="8"/><text x="50" y="60" textAnchor="middle" fontSize="36" fontWeight="bold" fill="#333">30</text></svg>
    case "limitation_50":
      return <svg viewBox="0 0 100 100" width={s} height={s}><circle cx="50" cy="50" r="45" fill="#FFF" stroke="#E53935" strokeWidth="8"/><text x="50" y="60" textAnchor="middle" fontSize="36" fontWeight="bold" fill="#333">50</text></svg>
    case "limitation_70":
      return <svg viewBox="0 0 100 100" width={s} height={s}><circle cx="50" cy="50" r="45" fill="#FFF" stroke="#E53935" strokeWidth="8"/><text x="50" y="60" textAnchor="middle" fontSize="36" fontWeight="bold" fill="#333">70</text></svg>
    case "limitation_110":
      return <svg viewBox="0 0 100 100" width={s} height={s}><circle cx="50" cy="50" r="45" fill="#FFF" stroke="#E53935" strokeWidth="8"/><text x="50" y="60" textAnchor="middle" fontSize="32" fontWeight="bold" fill="#333">110</text></svg>
    case "cedez_passage":
      return <svg viewBox="0 0 100 100" width={s} height={s}><polygon points="50,90 5,10 95,10" fill="#FFF" stroke="#E53935" strokeWidth="8" strokeLinejoin="round"/></svg>
    case "priorite_droite":
      return <svg viewBox="0 0 100 100" width={s} height={s}><polygon points="50,5 95,50 50,95 5,50" fill="#FFF" stroke="#333" strokeWidth="3"/><polygon points="50,20 80,50 50,80 20,50" fill="#FFF9C4" stroke="#F57F17" strokeWidth="2"/></svg>
    case "route_prioritaire":
      return <svg viewBox="0 0 100 100" width={s} height={s}><polygon points="50,5 95,50 50,95 5,50" fill="#FFF9C4" stroke="#F57F17" strokeWidth="4"/></svg>
    case "danger_virage":
      return <svg viewBox="0 0 100 100" width={s} height={s}><polygon points="50,8 95,88 5,88" fill="#FFF" stroke="#E53935" strokeWidth="6" strokeLinejoin="round"/><path d="M35 65 Q35 45 55 45 L55 45" fill="none" stroke="#333" strokeWidth="6" strokeLinecap="round"/><path d="M50 40 L58 45 L50 50" fill="none" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>
    case "danger_travaux":
      return <svg viewBox="0 0 100 100" width={s} height={s}><polygon points="50,8 95,88 5,88" fill="#FFF" stroke="#E53935" strokeWidth="6" strokeLinejoin="round"/><rect x="32" y="40" width="8" height="35" fill="#333" transform="rotate(-15,36,57)"/><rect x="58" y="40" width="8" height="35" fill="#333" transform="rotate(15,62,57)"/><rect x="35" y="52" width="30" height="6" rx="2" fill="#333"/></svg>
    case "danger_chaussee_glissante":
      return <svg viewBox="0 0 100 100" width={s} height={s}><polygon points="50,8 95,88 5,88" fill="#FFF" stroke="#E53935" strokeWidth="6" strokeLinejoin="round"/><path d="M38 70 Q42 55 50 60 Q58 65 55 50 Q52 40 60 35" fill="none" stroke="#333" strokeWidth="5" strokeLinecap="round"/></svg>
    case "obligation_droite":
      return <svg viewBox="0 0 100 100" width={s} height={s}><circle cx="50" cy="50" r="45" fill="#1565C0" stroke="#0D47A1" strokeWidth="3"/><path d="M35 50 L60 50" fill="none" stroke="#FFF" strokeWidth="8" strokeLinecap="round"/><path d="M52 38 L64 50 L52 62" fill="none" stroke="#FFF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/></svg>
    case "obligation_tout_droit":
      return <svg viewBox="0 0 100 100" width={s} height={s}><circle cx="50" cy="50" r="45" fill="#1565C0" stroke="#0D47A1" strokeWidth="3"/><path d="M50 70 L50 35" fill="none" stroke="#FFF" strokeWidth="8" strokeLinecap="round"/><path d="M38 45 L50 33 L62 45" fill="none" stroke="#FFF" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/></svg>
    case "rond_point":
      return <svg viewBox="0 0 100 100" width={s} height={s}><circle cx="50" cy="50" r="45" fill="#1565C0" stroke="#0D47A1" strokeWidth="3"/><circle cx="50" cy="50" r="18" fill="none" stroke="#FFF" strokeWidth="5"/><path d="M50 32 L58 26" fill="none" stroke="#FFF" strokeWidth="5" strokeLinecap="round"/></svg>
    case "passage_pieton":
      return <svg viewBox="0 0 100 100" width={s} height={s}><polygon points="50,8 95,88 5,88" fill="#FFF" stroke="#E53935" strokeWidth="6" strokeLinejoin="round"/><circle cx="50" cy="35" r="5" fill="#333"/><line x1="50" y1="40" x2="50" y2="62" stroke="#333" strokeWidth="4"/><line x1="50" y1="62" x2="40" y2="78" stroke="#333" strokeWidth="4" strokeLinecap="round"/><line x1="50" y1="62" x2="60" y2="78" stroke="#333" strokeWidth="4" strokeLinecap="round"/><line x1="50" y1="48" x2="38" y2="55" stroke="#333" strokeWidth="4" strokeLinecap="round"/><line x1="50" y1="48" x2="62" y2="55" stroke="#333" strokeWidth="4" strokeLinecap="round"/></svg>
    case "fin_limitation":
      return <svg viewBox="0 0 100 100" width={s} height={s}><circle cx="50" cy="50" r="45" fill="#FFF" stroke="#333" strokeWidth="4"/><line x1="20" y1="80" x2="80" y2="20" stroke="#333" strokeWidth="4"/></svg>
    case "stationnement_interdit":
      return <svg viewBox="0 0 100 100" width={s} height={s}><circle cx="50" cy="50" r="45" fill="#1565C0" stroke="#0D47A1" strokeWidth="3"/><line x1="25" y1="75" x2="75" y2="25" stroke="#E53935" strokeWidth="7"/></svg>
    default:
      return <svg viewBox="0 0 100 100" width={s} height={s}><circle cx="50" cy="50" r="45" fill="#CCC"/></svg>
  }
}

const PANNEAUX: Panneau[] = [
  { id: "p1", nom: "sens_interdit", categorie: "interdiction", reponseCorrecte: "Sens interdit", options: ["Sens interdit", "Stationnement interdit", "Arrêt interdit", "Interdiction de dépasser"], svg: (s) => <PanneauSVG type="sens_interdit" size={s} /> },
  { id: "p2", nom: "stop", categorie: "priorite", reponseCorrecte: "Arrêt obligatoire (STOP)", options: ["Arrêt obligatoire (STOP)", "Cédez le passage", "Sens interdit", "Passage interdit"], svg: (s) => <PanneauSVG type="stop" size={s} /> },
  { id: "p3", nom: "cedez_passage", categorie: "priorite", reponseCorrecte: "Cédez le passage", options: ["Cédez le passage", "Danger", "Arrêt obligatoire", "Route prioritaire"], svg: (s) => <PanneauSVG type="cedez_passage" size={s} /> },
  { id: "p4", nom: "limitation_30", categorie: "interdiction", reponseCorrecte: "Vitesse limitée à 30 km/h", options: ["Vitesse limitée à 30 km/h", "Vitesse minimale 30 km/h", "Zone 30 recommandée", "Distance minimale 30 m"], svg: (s) => <PanneauSVG type="limitation_30" size={s} /> },
  { id: "p5", nom: "limitation_50", categorie: "interdiction", reponseCorrecte: "Vitesse limitée à 50 km/h", options: ["Vitesse limitée à 50 km/h", "Entrée en agglomération", "Vitesse conseillée 50 km/h", "Distance minimale 50 m"], svg: (s) => <PanneauSVG type="limitation_50" size={s} /> },
  { id: "p6", nom: "limitation_70", categorie: "interdiction", reponseCorrecte: "Vitesse limitée à 70 km/h", options: ["Vitesse limitée à 70 km/h", "Vitesse minimale 70 km/h", "Route à 70 km/h recommandée", "Zone de travaux à 70 km/h"], svg: (s) => <PanneauSVG type="limitation_70" size={s} /> },
  { id: "p7", nom: "limitation_110", categorie: "interdiction", reponseCorrecte: "Vitesse limitée à 110 km/h", options: ["Vitesse limitée à 110 km/h", "Vitesse minimale 110 km/h", "Route express à 110 km/h", "Autoroute"], svg: (s) => <PanneauSVG type="limitation_110" size={s} /> },
  { id: "p8", nom: "interdit_tourner_gauche", categorie: "interdiction", reponseCorrecte: "Interdiction de tourner à gauche", options: ["Interdiction de tourner à gauche", "Direction obligatoire à droite", "Interdiction de faire demi-tour", "Sens interdit à gauche"], svg: (s) => <PanneauSVG type="interdit_tourner_gauche" size={s} /> },
  { id: "p9", nom: "interdit_depasser", categorie: "interdiction", reponseCorrecte: "Interdiction de dépasser", options: ["Interdiction de dépasser", "Interdiction de circuler côte à côte", "Voie réservée", "Chaussée rétrécie"], svg: (s) => <PanneauSVG type="interdit_depasser" size={s} /> },
  { id: "p10", nom: "route_prioritaire", categorie: "priorite", reponseCorrecte: "Route prioritaire", options: ["Route prioritaire", "Passage protégé", "Zone de rencontre", "Fin de toutes interdictions"], svg: (s) => <PanneauSVG type="route_prioritaire" size={s} /> },
  { id: "p11", nom: "priorite_droite", categorie: "priorite", reponseCorrecte: "Priorité ponctuelle (prochaine intersection)", options: ["Priorité ponctuelle (prochaine intersection)", "Route prioritaire", "Intersection à priorité à droite", "Passage protégé"], svg: (s) => <PanneauSVG type="priorite_droite" size={s} /> },
  { id: "p12", nom: "danger_virage", categorie: "danger", reponseCorrecte: "Virage dangereux à droite", options: ["Virage dangereux à droite", "Déviation obligatoire à droite", "Route sinueuse", "Direction obligatoire à droite"], svg: (s) => <PanneauSVG type="danger_virage" size={s} /> },
  { id: "p13", nom: "danger_travaux", categorie: "danger", reponseCorrecte: "Travaux en cours", options: ["Travaux en cours", "Chantier interdit au public", "Passage de chantier", "Sortie d'engins"], svg: (s) => <PanneauSVG type="danger_travaux" size={s} /> },
  { id: "p14", nom: "danger_chaussee_glissante", categorie: "danger", reponseCorrecte: "Chaussée glissante", options: ["Chaussée glissante", "Risque de verglas", "Route sinueuse", "Descente dangereuse"], svg: (s) => <PanneauSVG type="danger_chaussee_glissante" size={s} /> },
  { id: "p15", nom: "obligation_droite", categorie: "obligation", reponseCorrecte: "Direction obligatoire à droite", options: ["Direction obligatoire à droite", "Interdiction de tourner à gauche", "Déviation à droite", "Sens unique à droite"], svg: (s) => <PanneauSVG type="obligation_droite" size={s} /> },
  { id: "p16", nom: "obligation_tout_droit", categorie: "obligation", reponseCorrecte: "Direction obligatoire tout droit", options: ["Direction obligatoire tout droit", "Voie sans issue", "Route prioritaire", "Sens unique"], svg: (s) => <PanneauSVG type="obligation_tout_droit" size={s} /> },
  { id: "p17", nom: "rond_point", categorie: "obligation", reponseCorrecte: "Sens giratoire obligatoire", options: ["Sens giratoire obligatoire", "Rond-point interdit", "Demi-tour obligatoire", "Zone de stationnement circulaire"], svg: (s) => <PanneauSVG type="rond_point" size={s} /> },
  { id: "p18", nom: "passage_pieton", categorie: "danger", reponseCorrecte: "Danger : traversée de piétons", options: ["Danger : traversée de piétons", "Passage piéton obligatoire", "Zone piétonne", "Interdiction aux piétons"], svg: (s) => <PanneauSVG type="passage_pieton" size={s} /> },
  { id: "p19", nom: "fin_limitation", categorie: "indication", reponseCorrecte: "Fin de toutes les interdictions", options: ["Fin de toutes les interdictions", "Zone neutre", "Fin de zone 30", "Fin de travaux"], svg: (s) => <PanneauSVG type="fin_limitation" size={s} /> },
  { id: "p20", nom: "stationnement_interdit", categorie: "interdiction", reponseCorrecte: "Stationnement interdit", options: ["Stationnement interdit", "Arrêt et stationnement interdits", "Zone bleue", "Sens interdit"], svg: (s) => <PanneauSVG type="stationnement_interdit" size={s} /> },
]

const CAT_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  interdiction: { bg: "#FEE2E2", text: "#DC2626", label: "Interdiction" },
  danger: { bg: "#FEF3C7", text: "#D97706", label: "Danger" },
  obligation: { bg: "#DBEAFE", text: "#2563EB", label: "Obligation" },
  indication: { bg: "#F1F5F9", text: "#64748B", label: "Indication" },
  priorite: { bg: "#FEF9C3", text: "#A16207", label: "Priorité" },
}

export default function Signalisation() {
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [gameState, setGameState] = useState<"menu" | "showing" | "answering" | "feedback" | "results">("menu")
  const [questions, setQuestions] = useState<Panneau[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [showTimer, setShowTimer] = useState(3)
  const [mode, setMode] = useState<"flash" | "normal">("normal")

  useEffect(() => {
    createClient().auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setAuthLoading(false)
    })
  }, [])

  // Timer pour le mode flash
  useEffect(() => {
    if (gameState !== "showing") return
    if (showTimer <= 0) {
      setGameState("answering")
      return
    }
    const t = setTimeout(() => setShowTimer(prev => prev - 1), 1000)
    return () => clearTimeout(t)
  }, [gameState, showTimer])

  function startGame(m: "flash" | "normal") {
    const shuffled = [...PANNEAUX].sort(() => Math.random() - 0.5).slice(0, 10)
    setQuestions(shuffled)
    setMode(m)
    setCurrentIndex(0)
    setScore(0)
    setSelected(null)
    if (m === "flash") {
      setShowTimer(3)
      setGameState("showing")
    } else {
      setGameState("answering")
    }
  }

  function selectAnswer(idx: number) {
    if (selected !== null) return
    setSelected(idx)
    const correct = questions[currentIndex].options[idx] === questions[currentIndex].reponseCorrecte
    if (correct) setScore(prev => prev + 1)
    setGameState("feedback")
  }

  function next() {
    if (currentIndex + 1 >= questions.length) {
      setGameState("results")
    } else {
      setCurrentIndex(prev => prev + 1)
      setSelected(null)
      if (mode === "flash") {
        setShowTimer(3)
        setGameState("showing")
      } else {
        setGameState("answering")
      }
    }
  }

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-background)" }}>
      <svg className="animate-spin" style={{ color: "var(--color-primary)", width: 32, height: 32 }} fill="none" viewBox="0 0 24 24">
        <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  }

  if (!user) {
    return <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--color-background)" }}>
      <p className="text-lg font-bold mb-4">Connectez-vous pour jouer</p>
      <Link href="/connexion" className="btn-primary" style={{ textDecoration: "none" }}>Se connecter</Link>
    </div>
  }

  const panneau = questions[currentIndex]

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      <header className="border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/simulation" className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>
            <ChevronLeft size={16} /> Simulations
          </Link>
          <span className="text-sm font-bold" style={{ fontFamily: "var(--font-display)" }}>Signalisation</span>
          {gameState !== "menu" && gameState !== "results" && (
            <span className="text-sm font-bold" style={{ color: "var(--color-primary)" }}>{currentIndex + 1}/{questions.length}</span>
          )}
          {(gameState === "menu" || gameState === "results") && <div />}
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Menu */}
        {gameState === "menu" && (
          <div className="text-center animate-in">
            <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: "var(--color-primary-light)" }}>
              <Eye size={28} style={{ color: "var(--color-primary)" }} />
            </div>
            <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>Lecture de signalisation</h1>
            <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "var(--color-text-secondary)" }}>
              Identifiez les panneaux de signalisation routière. 20 panneaux, 10 questions par série.
            </p>
            <div className="flex flex-col gap-4 max-w-sm mx-auto">
              <button onClick={() => startGame("normal")} className="rounded-xl p-5 text-left transition-all"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--color-border)")}>
                <p className="text-sm font-bold">Mode classique</p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Le panneau reste visible pendant que vous répondez</p>
              </button>
              <button onClick={() => startGame("flash")} className="rounded-xl p-5 text-left transition-all"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "#F59E0B")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--color-border)")}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: "#F59E0B" }} />
                  <p className="text-sm font-bold">Mode flash</p>
                </div>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Le panneau s'affiche 3 secondes puis disparaît. Répondez de mémoire !</p>
              </button>
            </div>
          </div>
        )}

        {/* Affichage du panneau (mode flash) */}
        {gameState === "showing" && panneau && (
          <div className="text-center animate-in">
            <p className="text-sm font-semibold mb-4" style={{ color: "var(--color-text-muted)" }}>
              Mémorisez ce panneau — {showTimer}s
            </p>
            <div className="rounded-2xl p-10 mb-4 flex items-center justify-center" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
              {panneau.svg(160)}
            </div>
            <div className="h-1.5 rounded-full" style={{ background: "var(--color-border)" }}>
              <div className="h-1.5 rounded-full transition-all" style={{ width: `${(showTimer / 3) * 100}%`, background: "#F59E0B", transition: "width 1s linear" }} />
            </div>
          </div>
        )}

        {/* Phase de réponse */}
        {(gameState === "answering" || gameState === "feedback") && panneau && (
          <div className="animate-in">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: CAT_COLORS[panneau.categorie].bg, color: CAT_COLORS[panneau.categorie].text }}>
                {CAT_COLORS[panneau.categorie].label}
              </span>
              <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>Question {currentIndex + 1}/{questions.length}</span>
            </div>

            {/* Panneau visible en mode normal */}
            {mode === "normal" && (
              <div className="rounded-2xl p-8 mb-6 flex items-center justify-center" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                {panneau.svg(140)}
              </div>
            )}

            {/* Panneau masqué en mode flash */}
            {mode === "flash" && gameState === "answering" && (
              <div className="rounded-2xl p-8 mb-6 flex flex-col items-center justify-center" style={{ background: "var(--color-surface-hover)", border: "1px dashed var(--color-border)", minHeight: 180 }}>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Panneau masqué — répondez de mémoire</p>
              </div>
            )}

            {/* Panneau révélé en feedback mode flash */}
            {mode === "flash" && gameState === "feedback" && (
              <div className="rounded-2xl p-8 mb-6 flex items-center justify-center" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                {panneau.svg(140)}
              </div>
            )}

            <p className="text-base font-bold mb-4 text-center" style={{ fontFamily: "var(--font-display)" }}>
              Que signifie ce panneau ?
            </p>

            <div className="flex flex-col gap-2">
              {panneau.options.map((opt, i) => {
                let bg = "var(--color-surface)"
                let border = "var(--color-border)"
                let textColor = "var(--color-text)"

                if (gameState === "feedback") {
                  if (opt === panneau.reponseCorrecte) {
                    bg = "var(--color-success-light)"
                    border = "var(--color-primary)"
                    textColor = "var(--color-primary-dark)"
                  } else if (selected === i) {
                    bg = "var(--color-error-light)"
                    border = "var(--color-error)"
                    textColor = "var(--color-error)"
                  }
                }

                return (
                  <button key={i} onClick={() => selectAnswer(i)} disabled={gameState === "feedback"}
                    className="text-left p-4 rounded-xl transition-all flex items-center gap-3"
                    style={{ background: bg, border: `1.5px solid ${border}`, color: textColor, cursor: gameState === "feedback" ? "default" : "pointer" }}>
                    <span className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{
                      background: gameState === "feedback" && opt === panneau.reponseCorrecte ? "var(--color-primary)" : gameState === "feedback" && selected === i ? "var(--color-error)" : "var(--color-surface-hover)",
                      color: gameState === "feedback" && (opt === panneau.reponseCorrecte || selected === i) ? "white" : "var(--color-text-secondary)",
                    }}>
                      {gameState === "feedback" && opt === panneau.reponseCorrecte ? "✓" : gameState === "feedback" && selected === i ? "✕" : String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm font-medium">{opt}</span>
                  </button>
                )
              })}
            </div>

            {gameState === "feedback" && (
              <button onClick={next} className="btn-primary w-full mt-5">
                {currentIndex + 1 >= questions.length ? "Voir les résultats" : "Panneau suivant →"}
              </button>
            )}
          </div>
        )}

        {/* Résultats */}
        {gameState === "results" && (
          <div className="text-center animate-in">
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ background: score >= 7 ? "var(--color-primary-light)" : "var(--color-error-light)" }}>
              <Trophy size={36} style={{ color: score >= 7 ? "var(--color-primary)" : "var(--color-error)" }} />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
              {score >= 9 ? "Expert de la signalisation !" : score >= 7 ? "Bonne connaissance !" : score >= 5 ? "Continuez à réviser !" : "Révisez vos panneaux !"}
            </h1>
            <p className="text-4xl font-extrabold my-4" style={{ fontFamily: "var(--font-display)", color: score >= 7 ? "var(--color-primary)" : "var(--color-error)" }}>
              {score}/{questions.length}
            </p>
            <p className="text-sm mb-8" style={{ color: "var(--color-text-secondary)" }}>
              {Math.round((score / questions.length) * 100)} % de bonnes réponses
            </p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <button onClick={() => startGame(mode)} className="btn-primary w-full flex items-center justify-center gap-2">
                <RefreshCw size={16} /> Rejouer
              </button>
              <button onClick={() => setGameState("menu")} className="text-sm font-semibold px-6 py-3 rounded-xl"
                style={{ background: "var(--color-surface-hover)", color: "var(--color-text-secondary)", border: "none", cursor: "pointer" }}>
                Changer de mode
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
