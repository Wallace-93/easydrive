"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase-client"
import Link from "next/link"
import { ArrowUp, ArrowDown, RotateCcw, RotateCw, Trophy, RefreshCw, ChevronLeft } from "lucide-react"

type Level = {
  id: string
  nom: string
  description: string
  car: { x: number; y: number; angle: number }
  target: { x: number; y: number; w: number; h: number; angle: number }
  obstacles: { x: number; y: number; w: number; h: number; type: "car" | "wall" }[]
  walls: { x1: number; y1: number; x2: number; y2: number }[]
}

const LEVELS: Level[] = [
  {
    id: "creneau_droite",
    nom: "Créneau à droite",
    description: "Garez-vous entre les deux véhicules sur votre droite.",
    car: { x: 180, y: 220, angle: 0 },
    target: { x: 352, y: 195, w: 58, h: 100, angle: 0 },
    obstacles: [
      { x: 348, y: 60, w: 55, h: 90, type: "car" },
      { x: 348, y: 340, w: 55, h: 90, type: "car" },
      { x: 430, y: 0, w: 25, h: 500, type: "wall" },
    ],
    walls: [],
  },
  {
    id: "creneau_gauche",
    nom: "Créneau à gauche",
    description: "Garez-vous entre les deux véhicules sur votre gauche.",
    car: { x: 310, y: 220, angle: 0 },
    target: { x: 85, y: 195, w: 58, h: 100, angle: 0 },
    obstacles: [
      { x: 80, y: 60, w: 55, h: 90, type: "car" },
      { x: 80, y: 340, w: 55, h: 90, type: "car" },
      { x: 40, y: 0, w: 25, h: 500, type: "wall" },
    ],
    walls: [],
  },
]

const CAR_W = 30
const CAR_H = 55
const CANVAS_W = 500
const CANVAS_H = 500

export default function Manoeuvres() {
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [levelIndex, setLevelIndex] = useState(0)
  const [gameState, setGameState] = useState<"menu" | "playing" | "won" | "collision">("menu")
  const [carX, setCarX] = useState(0)
  const [carY, setCarY] = useState(0)
  const [carAngle, setCarAngle] = useState(0)
  const [moves, setMoves] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const keysRef = useRef<Set<string>>(new Set())
  const frameRef = useRef<number>(0)

  useEffect(() => {
    createClient().auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setAuthLoading(false)
    })
  }, [])

  const level = LEVELS[levelIndex]

  const startLevel = useCallback(() => {
    setCarX(level.car.x)
    setCarY(level.car.y)
    setCarAngle(level.car.angle)
    setMoves(0)
    setGameState("playing")
  }, [level])

  // Contrôles clavier
  useEffect(() => {
    function down(e: KeyboardEvent) {
      keysRef.current.add(e.key)
      e.preventDefault()
    }
    function up(e: KeyboardEvent) {
      keysRef.current.delete(e.key)
    }
    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    return () => {
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", up)
    }
  }, [])

  // Boucle de jeu
  useEffect(() => {
    if (gameState !== "playing") return

    function gameLoop() {
      const keys = keysRef.current
      let nx = carX
      let ny = carY
      let na = carAngle
      const speed = 2
      const turnSpeed = 2.5
      let moved = false

      const rad = (na * Math.PI) / 180

      if (keys.has("ArrowUp") || keys.has("z")) {
        nx += Math.sin(rad) * speed
        ny -= Math.cos(rad) * speed
        moved = true
      }
      if (keys.has("ArrowDown") || keys.has("s")) {
        nx -= Math.sin(rad) * speed
        ny += Math.cos(rad) * speed
        moved = true
      }
      if (keys.has("ArrowLeft") || keys.has("q")) {
        na += turnSpeed
        moved = true
      }
      if (keys.has("ArrowRight") || keys.has("d")) {
        na -= turnSpeed
        moved = true
      }

      if (moved) setMoves(prev => prev + 1)

      // Limites du canvas
      nx = Math.max(20, Math.min(CANVAS_W - 20, nx))
      ny = Math.max(20, Math.min(CANVAS_H - 20, ny))

      // Collision avec obstacles
      let collision = false
      for (const obs of level.obstacles) {
        if (checkCollision(nx, ny, na, obs)) {
          collision = true
          break
        }
      }

      if (collision) {
        setGameState("collision")
        return
      }

      setCarX(nx)
      setCarY(ny)
      setCarAngle(na)

      // Vérifier si la voiture est dans la zone cible
      const t = level.target
      const targetCX = t.x + t.w / 2
      const targetCY = t.y + t.h / 2
      const dx = Math.abs(nx - targetCX)
      const dy = Math.abs(ny - targetCY)
      const isInZone = dx < t.w * 0.6 && dy < t.h * 0.55

      // Normaliser la différence d'angle entre -180 et 180
      let angleDiff = ((na % 360) - t.angle) % 360
      if (angleDiff > 180) angleDiff -= 360
      if (angleDiff < -180) angleDiff += 360
      const isAligned = Math.abs(angleDiff) < 30 || Math.abs(Math.abs(angleDiff) - 360) < 30

      if (isInZone && isAligned) {
        setGameState("won")
        return
      }

      frameRef.current = requestAnimationFrame(gameLoop)
    }

    frameRef.current = requestAnimationFrame(gameLoop)
    return () => cancelAnimationFrame(frameRef.current)
  }, [gameState, carX, carY, carAngle, level])

  // Dessin
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)

    // Fond route
    ctx.fillStyle = "#E8E8E8"
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    // Zone cible
    const t = level.target
    ctx.save()
    ctx.translate(t.x + t.w / 2, t.y + t.h / 2)
    ctx.rotate((t.angle * Math.PI) / 180)
    ctx.fillStyle = "rgba(0, 179, 125, 0.25)"
    ctx.strokeStyle = "#00B37D"
    ctx.lineWidth = 2
    ctx.setLineDash([6, 4])
    ctx.fillRect(-t.w / 2, -t.h / 2, t.w, t.h)
    ctx.strokeRect(-t.w / 2, -t.h / 2, t.w, t.h)
    ctx.setLineDash([])
    ctx.restore()

    // Obstacles
    for (const obs of level.obstacles) {
      ctx.save()
      if (obs.type === "car") {
        ctx.fillStyle = "#78909C"
        ctx.strokeStyle = "#546E7A"
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.roundRect(obs.x, obs.y, obs.w, obs.h, 6)
        ctx.fill()
        ctx.stroke()
        // Vitres
        ctx.fillStyle = "#B3E5FC"
        ctx.fillRect(obs.x + 5, obs.y + 8, obs.w - 10, 12)
        ctx.fillRect(obs.x + 5, obs.y + obs.h - 20, obs.w - 10, 12)
      } else {
        ctx.fillStyle = "#9E9E9E"
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h)
      }
      ctx.restore()
    }

    // Voiture du joueur
    ctx.save()
    ctx.translate(carX, carY)
    ctx.rotate((carAngle * Math.PI) / 180)

    // Ombre
    ctx.fillStyle = "rgba(0,0,0,0.1)"
    ctx.beginPath()
    ctx.ellipse(2, 2, CAR_W / 2 + 2, CAR_H / 2 + 2, 0, 0, Math.PI * 2)
    ctx.fill()

    // Carrosserie
    ctx.fillStyle = "#00B37D"
    ctx.strokeStyle = "#009966"
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.roundRect(-CAR_W / 2, -CAR_H / 2, CAR_W, CAR_H, 6)
    ctx.fill()
    ctx.stroke()

    // Toit
    ctx.fillStyle = "#009966"
    ctx.beginPath()
    ctx.roundRect(-10, -15, 20, 18, 4)
    ctx.fill()

    // Pare-brise
    ctx.fillStyle = "rgba(179, 229, 252, 0.8)"
    ctx.fillRect(-9, -CAR_H / 2 + 5, 18, 10)

    // Phares avant
    ctx.fillStyle = "#FFF59D"
    ctx.fillRect(-10, -CAR_H / 2, 6, 4)
    ctx.fillRect(4, -CAR_H / 2, 6, 4)

    // Feux arrière
    ctx.fillStyle = "#EF5350"
    ctx.fillRect(-10, CAR_H / 2 - 4, 6, 3)
    ctx.fillRect(4, CAR_H / 2 - 4, 6, 3)

    ctx.restore()

  }, [carX, carY, carAngle, level])

  function checkCollision(cx: number, cy: number, ca: number, obs: { x: number; y: number; w: number; h: number }) {
    // Simplifié : vérification rectangulaire
    const carLeft = cx - CAR_W / 2
    const carRight = cx + CAR_W / 2
    const carTop = cy - CAR_H / 2
    const carBottom = cy + CAR_H / 2

    return !(carRight < obs.x || carLeft > obs.x + obs.w || carBottom < obs.y || carTop > obs.y + obs.h)
  }

  // Contrôles tactiles
  function touchControl(dir: string) {
    keysRef.current.add(dir)
    setTimeout(() => keysRef.current.delete(dir), 150)
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

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      <header className="border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/simulation" className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>
            <ChevronLeft size={16} /> Simulations
          </Link>
          <span className="text-sm font-bold" style={{ fontFamily: "var(--font-display)" }}>Manœuvres</span>
          <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>{levelIndex + 1}/{LEVELS.length}</span>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Sélecteur de niveau */}
        {gameState === "menu" && (
          <div className="animate-in">
            <h1 className="text-xl font-bold mb-6 text-center" style={{ fontFamily: "var(--font-display)" }}>Choisissez une manœuvre</h1>
            <div className="grid grid-cols-2 gap-3">
              {LEVELS.map((l, i) => (
                <button key={l.id} onClick={() => { setLevelIndex(i); startLevel() }}
                  className="rounded-xl p-4 text-left transition-all"
                  style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--color-border)")}>
                  <p className="text-sm font-bold mb-1">{l.nom}</p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{l.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Zone de jeu */}
        {(gameState === "playing" || gameState === "won" || gameState === "collision") && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold">{level.nom}</p>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{level.description}</p>
            </div>

            {/* Canvas */}
            <div className="rounded-2xl overflow-hidden mb-4" style={{ border: "2px solid var(--color-border)", position: "relative" }}>
              <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} style={{ width: "100%", height: "auto", display: "block" }} />

              {/* Overlay victoire */}
              {gameState === "won" && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,179,125,0.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                  <Trophy size={40} style={{ color: "white" }} />
                  <p className="text-xl font-bold" style={{ color: "white", fontFamily: "var(--font-display)" }}>Manœuvre réussie !</p>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>{moves} mouvements</p>
                  <div className="flex gap-3 mt-2">
                    <button onClick={startLevel} className="text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5"
                      style={{ background: "white", color: "var(--color-primary)", border: "none", cursor: "pointer" }}>
                      <RefreshCw size={14} /> Rejouer
                    </button>
                    {levelIndex < LEVELS.length - 1 && (
                      <button onClick={() => { setLevelIndex(prev => prev + 1); setTimeout(startLevel, 50) }}
                        className="text-sm font-semibold px-4 py-2 rounded-lg"
                        style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.3)", cursor: "pointer" }}>
                        Suivant →
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Overlay collision */}
              {gameState === "collision" && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(239,68,68,0.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                  <p className="text-xl font-bold" style={{ color: "white", fontFamily: "var(--font-display)" }}>Collision !</p>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>Vous avez touché un obstacle.</p>
                  <button onClick={startLevel} className="text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 mt-2"
                    style={{ background: "white", color: "var(--color-error)", border: "none", cursor: "pointer" }}>
                    <RefreshCw size={14} /> Réessayer
                  </button>
                </div>
              )}
            </div>

            {/* Contrôles tactiles */}
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
              <div />
              <button onMouseDown={() => touchControl("ArrowUp")} onTouchStart={() => touchControl("ArrowUp")}
                className="w-full py-4 rounded-xl flex items-center justify-center"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", cursor: "pointer" }}>
                <ArrowUp size={24} style={{ color: "var(--color-text)" }} />
              </button>
              <div />
              <button onMouseDown={() => touchControl("ArrowLeft")} onTouchStart={() => touchControl("ArrowLeft")}
                className="w-full py-4 rounded-xl flex items-center justify-center"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", cursor: "pointer" }}>
                <RotateCcw size={20} style={{ color: "var(--color-text)" }} />
              </button>
              <button onMouseDown={() => touchControl("ArrowDown")} onTouchStart={() => touchControl("ArrowDown")}
                className="w-full py-4 rounded-xl flex items-center justify-center"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", cursor: "pointer" }}>
                <ArrowDown size={24} style={{ color: "var(--color-text)" }} />
              </button>
              <button onMouseDown={() => touchControl("ArrowRight")} onTouchStart={() => touchControl("ArrowRight")}
                className="w-full py-4 rounded-xl flex items-center justify-center"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", cursor: "pointer" }}>
                <RotateCw size={20} style={{ color: "var(--color-text)" }} />
              </button>
            </div>

            <p className="text-xs text-center mt-4" style={{ color: "var(--color-text-muted)" }}>
              Clavier : flèches ou ZQSD · Mobile : boutons ci-dessus
            </p>

            <button onClick={() => setGameState("menu")} className="block mx-auto mt-4 text-xs font-medium"
              style={{ color: "var(--color-text-muted)", background: "none", border: "none", cursor: "pointer" }}>
              ← Retour au menu
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
