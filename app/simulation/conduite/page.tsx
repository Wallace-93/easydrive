"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import Link from "next/link"
import { ChevronLeft, Timer, CheckCircle, XCircle, Trophy, RefreshCw } from "lucide-react"

type Scenario = {
  id: string
  situation: string
  description: string
  options: { label: string; correct: boolean; explication: string }[]
  temps: number // secondes
  difficulte: 1 | 2 | 3
  scene: "intersection" | "pieton" | "feu" | "priorite" | "autoroute" | "ecole"
}

const SCENARIOS: Scenario[] = [
  {
    id: "s1", situation: "Feu orange fixe", difficulte: 1, temps: 8, scene: "feu",
    description: "Vous roulez à 50 km/h en ville. Le feu passe à l'orange alors que vous êtes à 30 mètres du feu.",
    options: [
      { label: "Accélérer pour passer", correct: false, explication: "Dangereux. À 30 mètres, vous avez le temps de freiner en toute sécurité." },
      { label: "Freiner progressivement", correct: true, explication: "Correct. À cette distance, vous pouvez vous arrêter sans danger." },
      { label: "Maintenir la vitesse", correct: false, explication: "Le feu va passer au rouge. Vous risquez de griller le feu." },
    ],
  },
  {
    id: "s2", situation: "Piéton au passage", difficulte: 1, temps: 6, scene: "pieton",
    description: "Un piéton s'engage sur un passage piéton devant vous. Il est à mi-chemin.",
    options: [
      { label: "Klaxonner pour le prévenir", correct: false, explication: "Interdit. Le klaxon n'est pas un outil pour presser les piétons." },
      { label: "S'arrêter et le laisser traverser", correct: true, explication: "Correct. Le piéton engagé sur un passage est prioritaire. Sanction : 6 points et 135 € d'amende en cas de non-respect." },
      { label: "Ralentir et passer derrière lui", correct: false, explication: "Dangereux. Le piéton peut changer de direction ou accélérer." },
    ],
  },
  {
    id: "s3", situation: "Priorité à droite", difficulte: 1, temps: 8, scene: "intersection",
    description: "Vous arrivez à une intersection sans signalisation. Un véhicule arrive par la droite à la même vitesse.",
    options: [
      { label: "Accélérer pour passer avant", correct: false, explication: "Dangereux et interdit. La priorité à droite s'applique." },
      { label: "Ralentir et lui céder le passage", correct: true, explication: "Correct. En l'absence de signalisation, le véhicule venant de droite est prioritaire." },
      { label: "Continuer normalement", correct: false, explication: "Vous devez céder le passage au véhicule venant de votre droite." },
    ],
  },
  {
    id: "s4", situation: "Sortie d'école", difficulte: 2, temps: 7, scene: "ecole",
    description: "Vous passez devant une école à l'heure de la sortie. Des enfants sont sur le trottoir, certains jouent près du bord.",
    options: [
      { label: "Maintenir 50 km/h, c'est la limite", correct: false, explication: "La limite légale n'est pas toujours la vitesse appropriée. La prudence impose de ralentir." },
      { label: "Ralentir fortement et surveiller les enfants", correct: true, explication: "Correct. Les enfants sont imprévisibles. Soyez prêt à freiner à tout moment." },
      { label: "Klaxonner pour signaler votre présence", correct: false, explication: "Le klaxon peut effrayer les enfants et provoquer un mouvement dangereux." },
    ],
  },
  {
    id: "s5", situation: "Véhicule prioritaire", difficulte: 2, temps: 6, scene: "priorite",
    description: "Vous entendez une sirène derrière vous. Un véhicule de pompiers avec gyrophare et sirène approche rapidement.",
    options: [
      { label: "Accélérer pour le laisser passer", correct: false, explication: "Ne jamais accélérer. Cela rend le dépassement plus dangereux." },
      { label: "Se rabattre à droite et s'arrêter si nécessaire", correct: true, explication: "Correct. Facilitez le passage du véhicule prioritaire en vous rabattant à droite." },
      { label: "Freiner brutalement", correct: false, explication: "Un freinage brutal peut surprendre le véhicule derrière vous et provoquer un accident." },
    ],
  },
  {
    id: "s6", situation: "Bus scolaire à l'arrêt", difficulte: 2, temps: 7, scene: "ecole",
    description: "Un bus scolaire est arrêté sur le bord de la route avec ses feux de détresse allumés. Des enfants descendent.",
    options: [
      { label: "Dépasser rapidement par la gauche", correct: false, explication: "Très dangereux. Des enfants peuvent traverser à tout moment après être descendus du bus." },
      { label: "Ralentir fortement et être prêt à s'arrêter", correct: true, explication: "Correct. Des enfants peuvent surgir de devant ou derrière le bus." },
      { label: "Klaxonner pour signaler votre passage", correct: false, explication: "Le klaxon peut effrayer un enfant et provoquer un mouvement imprévisible." },
    ],
  },
  {
    id: "s7", situation: "Insertion autoroute", difficulte: 3, temps: 8, scene: "autoroute",
    description: "Vous arrivez sur la voie d'accélération pour vous insérer sur l'autoroute. Le trafic est dense.",
    options: [
      { label: "S'arrêter au bout de la voie et attendre", correct: false, explication: "Très dangereux. S'insérer à vitesse nulle sur l'autoroute est extrêmement risqué." },
      { label: "Accélérer sur la voie d'insertion et s'insérer en adaptant sa vitesse", correct: true, explication: "Correct. Utilisez toute la longueur de la voie d'accélération pour atteindre la vitesse du trafic." },
      { label: "Forcer le passage au premier véhicule", correct: false, explication: "Les véhicules sur l'autoroute sont prioritaires. Adaptez votre insertion." },
    ],
  },
  {
    id: "s8", situation: "Rond-point occupé", difficulte: 2, temps: 7, scene: "intersection",
    description: "Vous souhaitez entrer dans un rond-point. Un véhicule circule à l'intérieur et approche de votre gauche.",
    options: [
      { label: "S'engager rapidement avant qu'il n'arrive", correct: false, explication: "Dangereux. Le véhicule dans le rond-point est prioritaire." },
      { label: "Céder le passage et attendre qu'il soit passé", correct: true, explication: "Correct. Les véhicules déjà engagés dans le rond-point sont prioritaires." },
      { label: "S'arrêter au milieu du rond-point", correct: false, explication: "Ne jamais s'arrêter dans un rond-point sauf nécessité absolue." },
    ],
  },
  {
    id: "s9", situation: "Brouillard épais", difficulte: 3, temps: 10, scene: "autoroute",
    description: "Vous roulez sur autoroute et un brouillard épais s'installe. La visibilité tombe à moins de 50 mètres.",
    options: [
      { label: "Allumer les feux de brouillard et continuer à 110 km/h", correct: false, explication: "Votre distance de freinage dépasse votre distance de visibilité. C'est suicidaire." },
      { label: "Réduire à 50 km/h, allumer les feux de brouillard et augmenter les distances", correct: true, explication: "Correct. Visibilité inférieure à 50 m = vitesse maximum 50 km/h. Utilisez les feux de brouillard." },
      { label: "S'arrêter sur la bande d'arrêt d'urgence", correct: false, explication: "Sauf panne, on ne s'arrête pas sur la bande d'arrêt d'urgence. Le risque de collision par l'arrière est élevé." },
    ],
  },
  {
    id: "s10", situation: "Cycliste à dépasser", difficulte: 2, temps: 8, scene: "priorite",
    description: "Vous souhaitez dépasser un cycliste sur une route à double sens. Un véhicule arrive en face, assez loin.",
    options: [
      { label: "Dépasser rapidement en serrant le cycliste", correct: false, explication: "Interdit. La distance latérale minimale est de 1,50 m hors agglomération." },
      { label: "Attendre que le véhicule en face soit passé, puis dépasser avec 1,50 m de marge", correct: true, explication: "Correct. Patience et sécurité. Laissez toujours au moins 1,50 m hors agglomération (1 m en ville)." },
      { label: "Klaxonner pour que le cycliste se range", correct: false, explication: "Le cycliste a le droit de circuler sur la chaussée. C'est à vous de le dépasser en sécurité." },
    ],
  },
  {
    id: "s11", situation: "Tramway approche", difficulte: 3, temps: 6, scene: "intersection",
    description: "Vous traversez une voie de tramway. Vous voyez un tramway approcher sur votre gauche.",
    options: [
      { label: "Accélérer pour dégager la voie", correct: false, explication: "Le tramway ne peut pas s'arrêter rapidement. Ne prenez aucun risque." },
      { label: "S'arrêter avant la voie et laisser passer le tramway", correct: true, explication: "Correct. Le tramway est toujours prioritaire quelle que soit sa direction d'approche." },
      { label: "Continuer, j'ai la priorité à droite", correct: false, explication: "Le tramway est TOUJOURS prioritaire. La priorité à droite ne s'applique pas au tramway." },
    ],
  },
  {
    id: "s12", situation: "Aquaplanage", difficulte: 3, temps: 5, scene: "autoroute",
    description: "Après une forte pluie, vous sentez soudain que le volant devient très léger et que la voiture ne répond plus.",
    options: [
      { label: "Freiner fort pour ralentir", correct: false, explication: "Surtout pas ! Freiner sur l'aquaplanage fait déraper le véhicule." },
      { label: "Lever le pied de l'accélérateur et tenir le volant droit", correct: true, explication: "Correct. Laissez la voiture décélérer naturellement. Les pneus retrouveront l'adhérence." },
      { label: "Braquer pour essayer de reprendre le contrôle", correct: false, explication: "Braquer sans adhérence peut provoquer un tête-à-queue lorsque les pneus reprennent contact." },
    ],
  },
]

export default function Conduite() {
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [gameState, setGameState] = useState<"menu" | "playing" | "feedback" | "results">("menu")
  const [difficulte, setDifficulte] = useState<1 | 2 | 3>(1)
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [timer, setTimer] = useState(0)
  const [timerActive, setTimerActive] = useState(false)

  useEffect(() => {
    createClient().auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setAuthLoading(false)
    })
  }, [])

  // Timer
  useEffect(() => {
    if (!timerActive || timer <= 0) return
    const t = setTimeout(() => {
      setTimer(prev => prev - 1)
      if (timer <= 1) {
        setTimerActive(false)
        setSelected(-1)
        setGameState("feedback")
      }
    }, 1000)
    return () => clearTimeout(t)
  }, [timerActive, timer])

  function startGame(diff: 1 | 2 | 3) {
    const filtered = SCENARIOS.filter(s => s.difficulte <= diff)
    const shuffled = filtered.sort(() => Math.random() - 0.5).slice(0, Math.min(filtered.length, 8))
    setScenarios(shuffled)
    setDifficulte(diff)
    setCurrentIndex(0)
    setScore(0)
    setGameState("playing")
    setTimer(shuffled[0]?.temps || 8)
    setTimerActive(true)
    setSelected(null)
  }

  function selectOption(index: number) {
    if (selected !== null) return
    setSelected(index)
    setTimerActive(false)
    if (scenarios[currentIndex].options[index]?.correct) {
      setScore(prev => prev + 1)
    }
    setGameState("feedback")
  }

  function nextScenario() {
    if (currentIndex + 1 >= scenarios.length) {
      setGameState("results")
    } else {
      const next = currentIndex + 1
      setCurrentIndex(next)
      setSelected(null)
      setTimer(scenarios[next].temps)
      setTimerActive(true)
      setGameState("playing")
    }
  }

  const SCENE_COLORS: Record<string, string> = {
    intersection: "#F59E0B",
    pieton: "#8B5CF6",
    feu: "#EF4444",
    priorite: "#3B82F6",
    autoroute: "#10B981",
    ecole: "#EC4899",
  }

  const SCENE_LABELS: Record<string, string> = {
    intersection: "Intersection",
    pieton: "Piéton",
    feu: "Signalisation",
    priorite: "Priorité",
    autoroute: "Autoroute",
    ecole: "Zone sensible",
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

  const scenario = scenarios[currentIndex]

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      <header className="border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/simulation" className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>
            <ChevronLeft size={16} /> Simulations
          </Link>
          <span className="text-sm font-bold" style={{ fontFamily: "var(--font-display)" }}>Conduite</span>
          {gameState !== "menu" && gameState !== "results" && (
            <span className="text-sm font-bold" style={{ color: "var(--color-primary)" }}>{currentIndex + 1}/{scenarios.length}</span>
          )}
          {(gameState === "menu" || gameState === "results") && <div />}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Menu */}
        {gameState === "menu" && (
          <div className="text-center animate-in">
            <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>Simulation de conduite</h1>
            <p className="text-sm mb-10 max-w-md mx-auto" style={{ color: "var(--color-text-secondary)" }}>
              Des situations de circulation réelles. Prenez la bonne décision avant la fin du temps imparti.
            </p>

            <div className="flex flex-col gap-4 max-w-sm mx-auto">
              {[
                { diff: 1 as const, label: "Débutant", desc: "Situations simples — temps confortable", color: "#10B981" },
                { diff: 2 as const, label: "Intermédiaire", desc: "Situations variées — temps réduit", color: "#F59E0B" },
                { diff: 3 as const, label: "Expert", desc: "Toutes situations — réflexes testés", color: "#EF4444" },
              ].map(d => (
                <button key={d.diff} onClick={() => startGame(d.diff)}
                  className="rounded-xl p-5 text-left transition-all"
                  style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = d.color)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--color-border)")}>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                    <div>
                      <p className="text-sm font-bold">{d.label}</p>
                      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{d.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scénario en cours */}
        {(gameState === "playing" || gameState === "feedback") && scenario && (
          <div className="animate-in">
            {/* Timer + catégorie */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: `${SCENE_COLORS[scenario.scene]}20`, color: SCENE_COLORS[scenario.scene] }}>
                {SCENE_LABELS[scenario.scene]}
              </span>
              <div className="flex items-center gap-2">
                <Timer size={16} style={{ color: timer <= 3 ? "var(--color-error)" : "var(--color-text-muted)" }} />
                <span className="text-sm font-bold" style={{ color: timer <= 3 ? "var(--color-error)" : "var(--color-text)", fontFamily: "var(--font-display)" }}>
                  {timer}s
                </span>
              </div>
            </div>

            {/* Barre de temps */}
            <div className="h-1.5 rounded-full mb-6" style={{ background: "var(--color-border)" }}>
              <div className="h-1.5 rounded-full transition-all" style={{
                width: `${(timer / scenario.temps) * 100}%`,
                background: timer <= 3 ? "var(--color-error)" : "var(--color-primary)",
                transition: "width 1s linear",
              }} />
            </div>

            {/* Situation */}
            <div className="rounded-2xl p-6 mb-6" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
              <h2 className="text-lg font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>{scenario.situation}</h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{scenario.description}</p>
            </div>

            {/* Options */}
            <div className="flex flex-col gap-3">
              {scenario.options.map((opt, i) => {
                let bg = "var(--color-surface)"
                let border = "var(--color-border)"
                let textColor = "var(--color-text)"

                if (gameState === "feedback") {
                  if (opt.correct) {
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
                  <button key={i} onClick={() => selectOption(i)} disabled={gameState === "feedback"}
                    className="text-left p-4 rounded-xl transition-all flex items-start gap-3"
                    style={{ background: bg, border: `1.5px solid ${border}`, color: textColor, cursor: gameState === "feedback" ? "default" : "pointer" }}>
                    <span className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{
                      background: gameState === "feedback" && opt.correct ? "var(--color-primary)" : gameState === "feedback" && selected === i ? "var(--color-error)" : "var(--color-surface-hover)",
                      color: gameState === "feedback" && (opt.correct || selected === i) ? "white" : "var(--color-text-secondary)",
                    }}>
                      {gameState === "feedback" && opt.correct ? <CheckCircle size={14} /> : gameState === "feedback" && selected === i ? <XCircle size={14} /> : String.fromCharCode(65 + i)}
                    </span>
                    <div>
                      <span className="text-sm font-medium">{opt.label}</span>
                      {gameState === "feedback" && (opt.correct || selected === i) && (
                        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{opt.explication}</p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Bouton suivant */}
            {gameState === "feedback" && (
              <button onClick={nextScenario} className="btn-primary w-full mt-6">
                {currentIndex + 1 >= scenarios.length ? "Voir les résultats" : "Scénario suivant →"}
              </button>
            )}

            {/* Temps écoulé */}
            {gameState === "feedback" && selected === -1 && (
              <div className="mt-4 p-4 rounded-xl text-sm text-center" style={{ background: "var(--color-error-light)", color: "var(--color-error)" }}>
                Temps écoulé ! La bonne réponse était : {scenario.options.find(o => o.correct)?.label}
              </div>
            )}
          </div>
        )}

        {/* Résultats */}
        {gameState === "results" && (
          <div className="text-center animate-in">
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ background: score >= scenarios.length * 0.7 ? "var(--color-primary-light)" : "var(--color-error-light)" }}>
              {score >= scenarios.length * 0.7 ? <Trophy size={36} style={{ color: "var(--color-primary)" }} /> : <RefreshCw size={36} style={{ color: "var(--color-error)" }} />}
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
              {score >= scenarios.length * 0.7 ? "Bien joué !" : "Continuez à vous entraîner !"}
            </h1>
            <p className="text-4xl font-extrabold my-4" style={{
              fontFamily: "var(--font-display)",
              color: score >= scenarios.length * 0.7 ? "var(--color-primary)" : "var(--color-error)",
            }}>
              {score}/{scenarios.length}
            </p>
            <p className="text-sm mb-8" style={{ color: "var(--color-text-secondary)" }}>
              {Math.round((score / scenarios.length) * 100)} % de bonnes décisions
            </p>

            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <button onClick={() => startGame(difficulte)} className="btn-primary w-full flex items-center justify-center gap-2">
                <RefreshCw size={16} /> Rejouer
              </button>
              <button onClick={() => setGameState("menu")}
                className="text-sm font-semibold px-6 py-3 rounded-xl"
                style={{ background: "var(--color-surface-hover)", color: "var(--color-text-secondary)", border: "none", cursor: "pointer" }}>
                Changer de difficulté
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
