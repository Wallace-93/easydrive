"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase-client"
import Link from "next/link"
import { ChevronLeft, AlertTriangle, Trophy, RefreshCw, Eye, Clock, Target } from "lucide-react"

type Danger = {
  id: string
  nom: string
  description: string
  delaiApparition: number // ms avant que le danger apparaisse
  dureeVisible: number // ms pendant lesquels le danger est cliquable
  zoneX: number // position du danger (% du canvas)
  zoneY: number
  zoneR: number // rayon de la zone cliquable
  decor: "ville" | "campagne" | "autoroute" | "ecole" | "nuit"
  elements: SceneElement[]
  dangerElement: DangerElement
}

type SceneElement = {
  type: "building" | "tree" | "car" | "road" | "sidewalk" | "sign" | "trafficLight"
  x: number
  y: number
  w: number
  h: number
  color: string
}

type DangerElement = {
  type: "pieton" | "enfant" | "cycliste" | "portiere" | "ballon" | "voiture" | "animal"
  label: string
  startX: number
  startY: number
  endX: number
  endY: number
}

const SCENARIOS: Danger[] = [
  {
    id: "d1",
    nom: "Piéton masqué",
    description: "Un piéton surgit de derrière un véhicule garé.",
    delaiApparition: 3500,
    dureeVisible: 5000,
    zoneX: 42, zoneY: 62, zoneR: 8,
    decor: "ville",
    elements: [
      { type: "road", x: 0, y: 55, w: 100, h: 35, color: "#555" },
      { type: "sidewalk", x: 0, y: 45, w: 100, h: 12, color: "#CCC" },
      { type: "sidewalk", x: 0, y: 88, w: 100, h: 12, color: "#CCC" },
      { type: "building", x: 5, y: 5, w: 20, h: 42, color: "#90A4AE" },
      { type: "building", x: 30, y: 10, w: 18, h: 37, color: "#78909C" },
      { type: "building", x: 55, y: 8, w: 22, h: 39, color: "#90A4AE" },
      { type: "building", x: 82, y: 12, w: 16, h: 35, color: "#78909C" },
      { type: "car", x: 35, y: 58, w: 12, h: 20, color: "#37474F" },
    ],
    dangerElement: { type: "pieton", label: "Piéton traversant depuis derrière un véhicule garé", startX: 37, startY: 58, endX: 52, endY: 72 },
  },
  {
    id: "d2",
    nom: "Enfant et ballon",
    description: "Un ballon roule sur la route, un enfant va le suivre.",
    delaiApparition: 2800,
    dureeVisible: 4500,
    zoneX: 55, zoneY: 55, zoneR: 9,
    decor: "ecole",
    elements: [
      { type: "road", x: 0, y: 55, w: 100, h: 35, color: "#555" },
      { type: "sidewalk", x: 0, y: 45, w: 100, h: 12, color: "#CCC" },
      { type: "sidewalk", x: 0, y: 88, w: 100, h: 12, color: "#CCC" },
      { type: "building", x: 60, y: 5, w: 35, h: 42, color: "#FFF9C4" },
      { type: "sign", x: 55, y: 35, w: 4, h: 15, color: "#F44336" },
      { type: "tree", x: 15, y: 30, w: 10, h: 18, color: "#388E3C" },
      { type: "tree", x: 85, y: 32, w: 10, h: 16, color: "#2E7D32" },
    ],
    dangerElement: { type: "enfant", label: "Enfant courant après un ballon", startX: 65, startY: 48, endX: 55, endY: 65 },
  },
  {
    id: "d3",
    nom: "Portière qui s'ouvre",
    description: "Un conducteur ouvre sa portière sans vérifier.",
    delaiApparition: 4000,
    dureeVisible: 3500,
    zoneX: 58, zoneY: 65, zoneR: 7,
    decor: "ville",
    elements: [
      { type: "road", x: 0, y: 55, w: 100, h: 35, color: "#555" },
      { type: "sidewalk", x: 0, y: 45, w: 100, h: 12, color: "#CCC" },
      { type: "sidewalk", x: 0, y: 88, w: 100, h: 12, color: "#CCC" },
      { type: "car", x: 55, y: 58, w: 12, h: 20, color: "#1565C0" },
      { type: "car", x: 55, y: 82, w: 12, h: 18, color: "#E53935" },
      { type: "building", x: 10, y: 8, w: 25, h: 39, color: "#78909C" },
      { type: "building", x: 70, y: 5, w: 28, h: 42, color: "#90A4AE" },
    ],
    dangerElement: { type: "portiere", label: "Portière ouverte soudainement", startX: 55, startY: 62, endX: 48, endY: 65 },
  },
  {
    id: "d4",
    nom: "Cycliste dans l'angle mort",
    description: "Un cycliste remonte la file par la droite.",
    delaiApparition: 3200,
    dureeVisible: 4000,
    zoneX: 70, zoneY: 68, zoneR: 8,
    decor: "ville",
    elements: [
      { type: "road", x: 0, y: 55, w: 100, h: 35, color: "#555" },
      { type: "sidewalk", x: 0, y: 45, w: 100, h: 12, color: "#CCC" },
      { type: "sidewalk", x: 0, y: 88, w: 100, h: 12, color: "#CCC" },
      { type: "car", x: 40, y: 60, w: 12, h: 20, color: "#455A64" },
      { type: "car", x: 40, y: 82, w: 12, h: 18, color: "#795548" },
      { type: "building", x: 5, y: 5, w: 30, h: 42, color: "#90A4AE" },
    ],
    dangerElement: { type: "cycliste", label: "Cycliste remontant la file", startX: 72, startY: 88, endX: 68, endY: 60 },
  },
  {
    id: "d5",
    nom: "Voiture grillant un stop",
    description: "Un véhicule ne marque pas l'arrêt au stop.",
    delaiApparition: 3800,
    dureeVisible: 3000,
    zoneX: 30, zoneY: 62, zoneR: 10,
    decor: "ville",
    elements: [
      { type: "road", x: 0, y: 55, w: 100, h: 35, color: "#555" },
      { type: "road", x: 20, y: 0, w: 25, h: 100, color: "#555" },
      { type: "sidewalk", x: 0, y: 45, w: 20, h: 12, color: "#CCC" },
      { type: "sidewalk", x: 45, y: 45, w: 55, h: 12, color: "#CCC" },
      { type: "sign", x: 42, y: 50, w: 3, h: 10, color: "#F44336" },
      { type: "building", x: 50, y: 5, w: 25, h: 42, color: "#78909C" },
      { type: "building", x: 50, y: 90, w: 25, h: 10, color: "#90A4AE" },
    ],
    dangerElement: { type: "voiture", label: "Véhicule grillant le stop", startX: 32, startY: 10, endX: 32, endY: 65 },
  },
  {
    id: "d6",
    nom: "Piéton au téléphone",
    description: "Un piéton traverse sans regarder, les yeux sur son téléphone.",
    delaiApparition: 2500,
    dureeVisible: 5000,
    zoneX: 48, zoneY: 60, zoneR: 8,
    decor: "ville",
    elements: [
      { type: "road", x: 0, y: 55, w: 100, h: 35, color: "#555" },
      { type: "sidewalk", x: 0, y: 45, w: 100, h: 12, color: "#CCC" },
      { type: "sidewalk", x: 0, y: 88, w: 100, h: 12, color: "#CCC" },
      { type: "building", x: 5, y: 5, w: 40, h: 42, color: "#90A4AE" },
      { type: "building", x: 55, y: 8, w: 40, h: 39, color: "#78909C" },
      { type: "tree", x: 50, y: 35, w: 8, h: 14, color: "#388E3C" },
    ],
    dangerElement: { type: "pieton", label: "Piéton traversant sans regarder", startX: 60, startY: 50, endX: 40, endY: 68 },
  },
  {
    id: "d7",
    nom: "Animal sur la route",
    description: "Un chien traverse soudainement la chaussée.",
    delaiApparition: 4200,
    dureeVisible: 3500,
    zoneX: 45, zoneY: 70, zoneR: 8,
    decor: "campagne",
    elements: [
      { type: "road", x: 15, y: 55, w: 70, h: 35, color: "#555" },
      { type: "tree", x: 5, y: 20, w: 12, h: 40, color: "#2E7D32" },
      { type: "tree", x: 88, y: 25, w: 10, h: 35, color: "#388E3C" },
      { type: "tree", x: 5, y: 65, w: 10, h: 30, color: "#2E7D32" },
      { type: "tree", x: 90, y: 60, w: 8, h: 28, color: "#388E3C" },
    ],
    dangerElement: { type: "animal", label: "Chien traversant la route", startX: 12, startY: 68, endX: 55, endY: 72 },
  },
  {
    id: "d8",
    nom: "Sortie de parking",
    description: "Un véhicule sort d'un parking souterrain en aveugle.",
    delaiApparition: 3000,
    dureeVisible: 4000,
    zoneX: 35, zoneY: 60, zoneR: 10,
    decor: "ville",
    elements: [
      { type: "road", x: 0, y: 55, w: 100, h: 35, color: "#555" },
      { type: "sidewalk", x: 0, y: 45, w: 100, h: 12, color: "#CCC" },
      { type: "sidewalk", x: 0, y: 88, w: 100, h: 12, color: "#CCC" },
      { type: "building", x: 20, y: 5, w: 30, h: 42, color: "#78909C" },
      { type: "building", x: 60, y: 8, w: 35, h: 39, color: "#90A4AE" },
    ],
    dangerElement: { type: "voiture", label: "Véhicule sortant d'un parking", startX: 32, startY: 47, endX: 32, endY: 65 },
  },
]

function SceneRenderer({ scenario, dangerVisible, dangerProgress }: { scenario: Danger; dangerVisible: boolean; dangerProgress: number }) {
  const d = scenario.dangerElement

  return (
    <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", background: scenario.decor === "campagne" ? "#8BC34A" : scenario.decor === "nuit" ? "#1A237E" : "#87CEEB" }}>
      {/* Éléments du décor */}
      {scenario.elements.map((el, i) => {
        if (el.type === "road") {
          return (
            <g key={i}>
              <rect x={el.x} y={el.y} width={el.w} height={el.h} fill={el.color} />
              {/* Ligne centrale */}
              <line x1={el.x} y1={el.y + el.h / 2} x2={el.x + el.w} y2={el.y + el.h / 2}
                stroke="#FFF" strokeWidth="0.4" strokeDasharray="3 2" />
            </g>
          )
        }
        if (el.type === "sidewalk") {
          return <rect key={i} x={el.x} y={el.y} width={el.w} height={el.h} fill={el.color} />
        }
        if (el.type === "building") {
          return (
            <g key={i}>
              <rect x={el.x} y={el.y} width={el.w} height={el.h} rx="1" fill={el.color} />
              {/* Fenêtres */}
              {Array.from({ length: Math.floor(el.w / 6) }).map((_, j) =>
                Array.from({ length: Math.floor(el.h / 8) }).map((_, k) => (
                  <rect key={`${j}-${k}`} x={el.x + 2 + j * 6} y={el.y + 3 + k * 8} width={3} height={4} rx="0.3" fill="#B0BEC5" />
                ))
              )}
            </g>
          )
        }
        if (el.type === "car") {
          return (
            <g key={i}>
              <rect x={el.x} y={el.y} width={el.w} height={el.h} rx="2" fill={el.color} />
              <rect x={el.x + 1.5} y={el.y + 2} width={el.w - 3} height={4} rx="0.5" fill="#B3E5FC" opacity="0.7" />
            </g>
          )
        }
        if (el.type === "tree") {
          return (
            <g key={i}>
              <rect x={el.x + el.w / 2 - 1} y={el.y + el.h * 0.6} width={2} height={el.h * 0.4} fill="#5D4037" />
              <ellipse cx={el.x + el.w / 2} cy={el.y + el.h * 0.35} rx={el.w / 2} ry={el.h * 0.4} fill={el.color} />
            </g>
          )
        }
        if (el.type === "sign") {
          return (
            <g key={i}>
              <rect x={el.x} y={el.y + el.h * 0.4} width={el.w} height={el.h * 0.6} fill="#888" />
              <polygon points={`${el.x + el.w / 2},${el.y} ${el.x + el.w + 2},${el.y + el.h * 0.35} ${el.x - 2},${el.y + el.h * 0.35}`}
                fill={el.color} stroke="#FFF" strokeWidth="0.3" />
            </g>
          )
        }
        return null
      })}

      {/* Élément de danger */}
      {dangerVisible && (
        <g style={{ transition: "all 0.5s ease" }}>
          {d.type === "pieton" && (
            <g>
              <circle cx={d.startX + (d.endX - d.startX) * dangerProgress}
                cy={d.startY + (d.endY - d.startY) * dangerProgress} r="2" fill="#FF7043" />
              <rect x={d.startX + (d.endX - d.startX) * dangerProgress - 1}
                y={d.startY + (d.endY - d.startY) * dangerProgress + 1.5}
                width="2" height="4" rx="0.5" fill="#5D4037" />
              <circle cx={d.startX + (d.endX - d.startX) * dangerProgress}
                cy={d.startY + (d.endY - d.startY) * dangerProgress - 1.5} r="1.5" fill="#FFCC80" />
            </g>
          )}
          {d.type === "enfant" && (
            <g>
              {/* Ballon */}
              <circle cx={d.startX + (d.endX - d.startX) * Math.min(dangerProgress * 1.5, 1) - 5}
                cy={d.startY + (d.endY - d.startY) * Math.min(dangerProgress * 1.5, 1) + 2} r="1.5" fill="#F44336" />
              {/* Enfant */}
              <circle cx={d.startX + (d.endX - d.startX) * dangerProgress}
                cy={d.startY + (d.endY - d.startY) * dangerProgress} r="1.8" fill="#FF7043" />
              <circle cx={d.startX + (d.endX - d.startX) * dangerProgress}
                cy={d.startY + (d.endY - d.startY) * dangerProgress - 1.5} r="1.3" fill="#FFCC80" />
            </g>
          )}
          {d.type === "cycliste" && (
            <g>
              <circle cx={d.startX + (d.endX - d.startX) * dangerProgress}
                cy={d.startY + (d.endY - d.startY) * dangerProgress} r="1.5" fill="#333" />
              <circle cx={d.startX + (d.endX - d.startX) * dangerProgress}
                cy={d.startY + (d.endY - d.startY) * dangerProgress - 3} r="1.3" fill="#FFCC80" />
              <rect x={d.startX + (d.endX - d.startX) * dangerProgress - 0.8}
                y={d.startY + (d.endY - d.startY) * dangerProgress - 2}
                width="1.6" height="3" fill="#2196F3" />
            </g>
          )}
          {d.type === "portiere" && (
            <g>
              <rect x={d.startX + (d.endX - d.startX) * dangerProgress - 2}
                y={d.startY + (d.endY - d.startY) * dangerProgress - 3}
                width="4" height="6" rx="0.5" fill="#1565C0" opacity={0.8}
                transform={`rotate(${-30 * dangerProgress}, ${d.startX + (d.endX - d.startX) * dangerProgress}, ${d.startY + (d.endY - d.startY) * dangerProgress})`} />
            </g>
          )}
          {(d.type === "voiture") && (
            <g>
              <rect x={d.startX + (d.endX - d.startX) * dangerProgress - 5}
                y={d.startY + (d.endY - d.startY) * dangerProgress - 4}
                width="10" height="16" rx="2" fill="#E53935" />
              <rect x={d.startX + (d.endX - d.startX) * dangerProgress - 3.5}
                y={d.startY + (d.endY - d.startY) * dangerProgress - 2}
                width="7" height="3.5" rx="0.5" fill="#B3E5FC" opacity="0.7" />
            </g>
          )}
          {d.type === "animal" && (
            <g>
              <ellipse cx={d.startX + (d.endX - d.startX) * dangerProgress}
                cy={d.startY + (d.endY - d.startY) * dangerProgress}
                rx="2.5" ry="1.5" fill="#795548" />
              <circle cx={d.startX + (d.endX - d.startX) * dangerProgress + 2}
                cy={d.startY + (d.endY - d.startY) * dangerProgress - 1} r="1" fill="#795548" />
            </g>
          )}
        </g>
      )}
    </svg>
  )
}

export default function Dangers() {
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [gameState, setGameState] = useState<"menu" | "watching" | "feedback" | "results">("menu")
  const [scenarios, setScenarios] = useState<Danger[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dangerVisible, setDangerVisible] = useState(false)
  const [dangerProgress, setDangerProgress] = useState(0)
  const [dangerTime, setDangerTime] = useState(0) // quand le danger est apparu
  const [clicked, setClicked] = useState(false)
  const [reactionTime, setReactionTime] = useState<number | null>(null)
  const [falseClick, setFalseClick] = useState(false)
  const [missed, setMissed] = useState(false)
  const [scores, setScores] = useState<number[]>([])
  const animRef = useRef<number>(0)
  const dangerTimerRef = useRef<any>(null)
  const endTimerRef = useRef<any>(null)

  useEffect(() => {
    createClient().auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setAuthLoading(false)
    })
  }, [])

  function startGame() {
    const shuffled = [...SCENARIOS].sort(() => Math.random() - 0.5).slice(0, 6)
    setScenarios(shuffled)
    setCurrentIndex(0)
    setScores([])
    startScenario(shuffled, 0)
  }

  function startScenario(scens: Danger[], idx: number) {
    setDangerVisible(false)
    setDangerProgress(0)
    setClicked(false)
    setReactionTime(null)
    setFalseClick(false)
    setMissed(false)
    setGameState("watching")

    const scenario = scens[idx]

    // Apparition du danger après un délai
    dangerTimerRef.current = setTimeout(() => {
      setDangerVisible(true)
      setDangerTime(Date.now())

      // Animation du danger
      let progress = 0
      function animateDanger() {
        progress += 0.008
        setDangerProgress(Math.min(progress, 1))
        if (progress < 1) {
          animRef.current = requestAnimationFrame(animateDanger)
        }
      }
      animRef.current = requestAnimationFrame(animateDanger)

      // Fin du temps si pas cliqué
      endTimerRef.current = setTimeout(() => {
        setMissed(true)
        setGameState("feedback")
        cancelAnimationFrame(animRef.current)
      }, scenario.dureeVisible)
    }, scenario.delaiApparition)
  }

  function handleClick() {
    if (clicked || gameState !== "watching") return

    if (!dangerVisible) {
      setFalseClick(true)
      return
    }

    setClicked(true)
    clearTimeout(endTimerRef.current)
    cancelAnimationFrame(animRef.current)

    const reaction = Date.now() - dangerTime
    setReactionTime(reaction)

    let points = 0
    if (reaction < 1000) points = 5
    else if (reaction < 2000) points = 4
    else if (reaction < 3000) points = 3
    else if (reaction < 4000) points = 2
    else points = 1

    setScores(prev => [...prev, points])
    setGameState("feedback")
  }

  function nextScenario() {
    clearTimeout(dangerTimerRef.current)
    clearTimeout(endTimerRef.current)
    cancelAnimationFrame(animRef.current)

    if (missed) {
      setScores(prev => [...prev, 0])
    }

    if (currentIndex + 1 >= scenarios.length) {
      setGameState("results")
    } else {
      const next = currentIndex + 1
      setCurrentIndex(next)
      startScenario(scenarios, next)
    }
  }

  useEffect(() => {
    return () => {
      clearTimeout(dangerTimerRef.current)
      clearTimeout(endTimerRef.current)
      cancelAnimationFrame(animRef.current)
    }
  }, [])

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
  const totalScore = scores.reduce((a, b) => a + b, 0)
  const maxScore = scenarios.length * 5

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      <header className="border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/simulation" className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>
            <ChevronLeft size={16} /> Simulations
          </Link>
          <span className="text-sm font-bold" style={{ fontFamily: "var(--font-display)" }}>Perception des dangers</span>
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
            <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: "var(--color-primary-light)" }}>
              <Eye size={28} style={{ color: "var(--color-primary)" }} />
            </div>
            <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>Perception des dangers</h1>
            <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "var(--color-text-secondary)" }}>
              Observez la scène de conduite. Dès qu'un danger apparaît, cliquez dessus le plus vite possible. Plus vous réagissez vite, plus vous marquez de points.
            </p>

            <div className="rounded-2xl p-6 mb-8 text-left" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
              <p className="text-sm font-bold mb-3">Comment ça marche :</p>
              <div className="flex flex-col gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                <div className="flex items-start gap-2"><Target size={14} className="flex-shrink-0 mt-0.5" style={{ color: "var(--color-primary)" }} /> <span>Observez attentivement la scène de route</span></div>
                <div className="flex items-start gap-2"><AlertTriangle size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#F59E0B" }} /> <span>Un danger va apparaître après quelques secondes</span></div>
                <div className="flex items-start gap-2"><Clock size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#EF4444" }} /> <span>Cliquez dès que vous le repérez — le temps de réaction compte</span></div>
              </div>
              <div className="mt-4 pt-4 flex flex-wrap gap-3" style={{ borderTop: "1px solid var(--color-border)" }}>
                <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "var(--color-primary-light)", color: "var(--color-primary-dark)" }}>{"< 1s = 5 pts"}</span>
                <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "#FEF3C7", color: "#D97706" }}>{"< 2s = 4 pts"}</span>
                <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "#FEE2E2", color: "#DC2626" }}>{"< 3s = 3 pts"}</span>
                <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "var(--color-surface-hover)", color: "var(--color-text-muted)" }}>Manqué = 0 pt</span>
              </div>
            </div>

            <button onClick={startGame} className="btn-primary text-base px-10 py-4">
              Commencer →
            </button>
          </div>
        )}

        {/* Scène en cours */}
        {(gameState === "watching" || gameState === "feedback") && scenario && (
          <div className="animate-in">
            <p className="text-xs font-semibold mb-3 text-center" style={{ color: "var(--color-text-muted)" }}>
              {gameState === "watching" ? "Observez la scène et cliquez dès qu'un danger apparaît" : scenario.dangerElement.label}
            </p>

            {/* Zone de la scène */}
            <div className="rounded-2xl overflow-hidden mb-4 relative" style={{ border: "2px solid var(--color-border)", cursor: gameState === "watching" ? "crosshair" : "default", aspectRatio: "16/10" }}
              onClick={handleClick}>
              <SceneRenderer scenario={scenario} dangerVisible={dangerVisible} dangerProgress={dangerProgress} />

              {/* Indicateur de faux clic */}
              {falseClick && (
                <div style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", background: "rgba(239,68,68,0.9)", color: "white", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 8 }}>
                  Pas encore de danger !
                </div>
              )}
            </div>

            {/* Feedback */}
            {gameState === "feedback" && (
              <div className="animate-in">
                <div className="rounded-xl p-5 mb-4" style={{
                  background: missed ? "var(--color-error-light)" : "var(--color-success-light)",
                  border: `1px solid ${missed ? "rgba(239,68,68,0.2)" : "rgba(0,179,125,0.2)"}`,
                }}>
                  {missed ? (
                    <div className="text-center">
                      <p className="text-base font-bold mb-1" style={{ color: "var(--color-error)" }}>Danger manqué !</p>
                      <p className="text-sm" style={{ color: "var(--color-error)" }}>{scenario.dangerElement.label}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-base font-bold mb-1" style={{ color: "var(--color-primary-dark)" }}>Danger repéré !</p>
                      <p className="text-2xl font-extrabold my-2" style={{ fontFamily: "var(--font-display)", color: "var(--color-primary)" }}>
                        {reactionTime ? `${(reactionTime / 1000).toFixed(1)}s` : "—"}
                      </p>
                      <p className="text-sm" style={{ color: "var(--color-primary)" }}>
                        {reactionTime && reactionTime < 1000 ? "Réflexes excellents !" : reactionTime && reactionTime < 2000 ? "Bonne réactivité !" : reactionTime && reactionTime < 3000 ? "Réaction correcte." : "Un peu lent, restez vigilant."}
                      </p>
                    </div>
                  )}
                </div>

                <button onClick={nextScenario} className="btn-primary w-full">
                  {currentIndex + 1 >= scenarios.length ? "Voir les résultats" : "Scène suivante →"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Résultats */}
        {gameState === "results" && (
          <div className="text-center animate-in">
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ background: totalScore >= maxScore * 0.6 ? "var(--color-primary-light)" : "var(--color-error-light)" }}>
              <Trophy size={36} style={{ color: totalScore >= maxScore * 0.6 ? "var(--color-primary)" : "var(--color-error)" }} />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
              {totalScore >= maxScore * 0.8 ? "Vigilance exemplaire !" : totalScore >= maxScore * 0.6 ? "Bonne perception !" : "Entraînez-vous encore !"}
            </h1>
            <p className="text-4xl font-extrabold my-4" style={{
              fontFamily: "var(--font-display)",
              color: totalScore >= maxScore * 0.6 ? "var(--color-primary)" : "var(--color-error)",
            }}>
              {totalScore}/{maxScore}
            </p>

            {/* Détail par scénario */}
            <div className="rounded-xl p-4 mb-6 text-left" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
              {scenarios.map((s, i) => (
                <div key={s.id} className="flex items-center justify-between py-2" style={{ borderBottom: i < scenarios.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                  <span className="text-xs">{s.nom}</span>
                  <span className="text-xs font-bold" style={{ color: scores[i] >= 4 ? "var(--color-primary)" : scores[i] >= 2 ? "#F59E0B" : "var(--color-error)" }}>
                    {scores[i] || 0}/5
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <button onClick={startGame} className="btn-primary w-full flex items-center justify-center gap-2">
                <RefreshCw size={16} /> Rejouer
              </button>
              <Link href="/simulation" className="text-sm font-semibold px-6 py-3 rounded-xl text-center"
                style={{ background: "var(--color-surface-hover)", color: "var(--color-text-secondary)", textDecoration: "none" }}>
                Autres simulations
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
