"use client"

import { useEffect, useState, useRef, useCallback } from "react"

export function BackgroundScene() {
  const pathRef = useRef<SVGPathElement>(null)
  const targetProgress = useRef(0)
  const currentProgress = useRef(0)
  const [carPos, setCarPos] = useState({ x: 0, y: 0, angle: 0 })
  const [svgH, setSvgH] = useState(4000)
  const frameRef = useRef<number>(0)

  // Écouter le scroll
  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      targetProgress.current = docHeight > 0 ? scrollTop / docHeight : 0
      setSvgH(document.documentElement.scrollHeight)
    }
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleScroll)
    }
  }, [])

  // Animation fluide avec lerp
  const animate = useCallback(() => {
    // Interpolation douce : la voiture rattrape progressivement la position cible
    currentProgress.current += (targetProgress.current - currentProgress.current) * 0.04

    if (pathRef.current) {
      const path = pathRef.current
      const totalLength = path.getTotalLength()
      const len = Math.min(currentProgress.current, 1) * totalLength

      const pt = path.getPointAtLength(len)
      const ptAhead = path.getPointAtLength(Math.min(len + 8, totalLength))
      const angle = Math.atan2(ptAhead.y - pt.y, ptAhead.x - pt.x) * (180 / Math.PI)

      setCarPos({ x: pt.x, y: pt.y, angle })
    }

    frameRef.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [animate])

  const viewH = svgH * 0.85

  // Route qui longe les bords gauche et droit, sans passer au centre
  const roadPath = `
    M 45 40
    C 45 180, 40 280, 45 400
    C 55 520, 460 550, 460 700
    C 460 850, 55 880, 45 1050
    C 35 1220, 460 1250, 460 1400
    C 460 1560, 55 1580, 45 1750
    C 35 1920, 460 1940, 460 2100
    C 460 2270, 55 2290, 45 2450
    C 35 2620, 460 2640, 460 2800
    C 460 2970, 55 2990, 45 3150
    C 35 3320, 460 3340, 460 3500
    C 460 3670, 55 3690, 45 3850
    C 35 4020, 460 4040, 460 4200
  `

  // Arbres positionnés sur les côtés opposés à la route
  const trees = [
    // Quand la route est à gauche, arbres à droite (et vice versa)
    // Route à gauche (début)
    [430, 100], [450, 200], [420, 320],
    // Route traverse vers la droite
    [60, 600], [30, 700],
    // Route à droite
    [50, 800], [70, 900], [40, 1000],
    // Route traverse vers la gauche
    [440, 1100], [460, 1200],
    // Route à gauche
    [430, 1300], [450, 1400], [420, 1500],
    // Route traverse vers la droite
    [60, 1600], [30, 1700],
    // Route à droite
    [50, 1800], [70, 1900], [40, 2000],
    // Continue...
    [440, 2150], [460, 2250],
    [430, 2350], [450, 2500],
    [60, 2600], [30, 2700],
    [50, 2850], [70, 2950],
    [440, 3050], [460, 3200],
    [430, 3350], [450, 3500],
    [60, 3600], [30, 3700],
    [50, 3850], [70, 3950],
    [440, 4050], [460, 4150],
  ]

  const signs = [
    [45, 250, "50"], [460, 850, "30"], [45, 1400, "50"],
    [460, 1950, "30"], [45, 2600, "50"], [460, 3200, "30"],
    [45, 3850, "50"],
  ]

  const buildings = [
    [425, 450, 35, 50], [5, 750, 30, 42],
    [430, 1550, 32, 45], [8, 1950, 28, 38],
    [425, 2550, 35, 50], [5, 3050, 30, 42],
    [430, 3550, 32, 45], [8, 4050, 28, 38],
  ]

  return (
    <div style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: `${svgH}px`,
      zIndex: 0,
      pointerEvents: "none",
      overflow: "hidden",
    }}>
      <svg
        viewBox={`0 0 500 ${viewH}`}
        preserveAspectRatio="xMidYMin slice"
        style={{ width: "100%", height: "100%", opacity: 0.15 }}
      >
        {/* Route — ombre portée */}
        <path d={roadPath} fill="none" stroke="#000" strokeWidth="56" strokeLinecap="round" strokeLinejoin="round" opacity="0.15" />

        {/* Route — asphalte */}
        <path d={roadPath} fill="none" stroke="#555" strokeWidth="48" strokeLinecap="round" strokeLinejoin="round" />

        {/* Chemin invisible pour positionner la voiture */}
        <path ref={pathRef} d={roadPath} fill="none" stroke="transparent" strokeWidth="0" />

        {/* Ligne blanche centrale animée */}
        <path d={roadPath} fill="none" stroke="#FFF" strokeWidth="2" strokeDasharray="14 10" strokeLinecap="round">
          <animate attributeName="stroke-dashoffset" values="0;-24" dur="0.7s" repeatCount="indefinite" />
        </path>

        {/* Bords de route */}
        <path d={roadPath} fill="none" stroke="#DDD" strokeWidth="49" strokeLinecap="round" strokeLinejoin="round" opacity="0" />
        <path d={roadPath} fill="none" stroke="#999" strokeWidth="48.5" strokeDasharray="2 30" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />

        {/* Bâtiments */}
        {buildings.map(([x, y, w, h], i) => (
          <g key={`b-${i}`}>
            <rect x={x} y={y - h} width={w} height={h} rx="2" fill={i % 2 === 0 ? "#78909C" : "#90A4AE"} />
            {Array.from({ length: Math.floor(h / 12) }).map((_, j) => (
              <g key={`bw-${i}-${j}`}>
                <rect x={x + 4} y={y - h + 5 + j * 12} width={5} height={5} rx="1" fill="#B0BEC5" />
                {w > 28 && <rect x={x + w - 9} y={y - h + 5 + j * 12} width={5} height={5} rx="1" fill="#B0BEC5" />}
              </g>
            ))}
          </g>
        ))}

        {/* Arbres */}
        {trees.map(([x, y], i) => {
          const s = 10 + (i % 4) * 3
          const th = 14 + (i % 3) * 4
          return (
            <g key={`t-${i}`}>
              <rect x={x - 2} y={y - th} width={4} height={th} rx="1" fill="#5D4037" />
              <ellipse cx={x} cy={y - th - s * 0.4} rx={s} ry={s * 0.75} fill="#2E7D32" />
              <ellipse cx={x - s * 0.25} cy={y - th - s * 0.15} rx={s * 0.65} ry={s * 0.55} fill="#388E3C" />
            </g>
          )
        })}

        {/* Panneaux */}
        {signs.map(([x, y, text], i) => (
          <g key={`s-${i}`}>
            <rect x={Number(x) - 1} y={Number(y) - 28} width={3} height={28} fill="#888" />
            <circle cx={Number(x)} cy={Number(y) - 36} r={9} fill="#FFF" stroke="#E53935" strokeWidth="2" />
            <text x={Number(x)} y={Number(y) - 33} textAnchor="middle" fontSize="7" fontWeight="bold" fill="#333">{text}</text>
          </g>
        ))}

        {/* Voiture auto-école */}
        <g transform={`translate(${carPos.x}, ${carPos.y}) rotate(${carPos.angle})`}>
          <ellipse cx="0" cy="10" rx="20" ry="4.5" fill="#000" opacity="0.2" />

          {/* Carrosserie */}
          <rect x="-22" y="-7" width="44" height="16" rx="5" fill="#00B37D" />

          {/* Toit */}
          <rect x="-10" y="-16" width="22" height="11" rx="3.5" fill="#009966" />

          {/* Panneau JC */}
          <rect x="-6" y="-22" width="14" height="7" rx="2.5" fill="#FFF" stroke="#00B37D" strokeWidth="0.8" />
          <text x="1" y="-17" textAnchor="middle" fontSize="4.5" fontWeight="bold" fill="#00B37D">JC</text>

          {/* Vitres */}
          <rect x="6" y="-13" width="11" height="7" rx="1.5" fill="#B3E5FC" opacity="0.85" />
          <rect x="-14" y="-13" width="9" height="7" rx="1.5" fill="#B3E5FC" opacity="0.85" />

          {/* Phares */}
          <rect x="20" y="-2" width="3.5" height="4.5" rx="1" fill="#FFF59D" />
          <rect x="-23" y="-1" width="2.5" height="3.5" rx="1" fill="#EF5350" />

          {/* Roues */}
          <circle cx="-11" cy="9" r="4.5" fill="#333" />
          <circle cx="-11" cy="9" r="2" fill="#777" />
          <circle cx="12" cy="9" r="4.5" fill="#333" />
          <circle cx="12" cy="9" r="2" fill="#777" />

          {/* Moniteur + élève */}
          <circle cx="-3" cy="-10" r="3" fill="#5D4037" />
          <circle cx="11" cy="-10" r="3" fill="#3E2723" />
        </g>
      </svg>
    </div>
  )
}
