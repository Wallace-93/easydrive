"use client"

import { useEffect, useState, useRef } from "react"

export function BackgroundScene() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [pageHeight, setPageHeight] = useState(3000)
  const pathRef = useRef<SVGPathElement>(null)
  const [carPos, setCarPos] = useState({ x: 0, y: 0, angle: 0 })

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? scrollTop / docHeight : 0
      setScrollProgress(Math.min(progress, 1))
      setPageHeight(document.documentElement.scrollHeight)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleScroll)
    }
  }, [])

  useEffect(() => {
    if (!pathRef.current) return
    const path = pathRef.current
    const totalLength = path.getTotalLength()
    const currentLength = scrollProgress * totalLength

    const point = path.getPointAtLength(currentLength)
    const pointAhead = path.getPointAtLength(Math.min(currentLength + 5, totalLength))
    const angle = Math.atan2(pointAhead.y - point.y, pointAhead.x - point.x) * (180 / Math.PI)

    setCarPos({ x: point.x, y: point.y, angle })
  }, [scrollProgress])

  const svgHeight = Math.max(pageHeight * 0.95, 3000)

  // Route qui serpente à travers la page
  const roadPath = `
    M 120 60
    C 350 200, 50 400, 280 550
    C 450 680, 80 800, 200 950
    C 380 1100, 50 1250, 320 1400
    C 500 1500, 100 1650, 250 1800
    C 420 1950, 60 2100, 300 2250
    C 480 2380, 120 2500, 280 2650
    C 400 2780, 80 2900, 250 3050
    C 450 3200, 100 3350, 300 3500
    C 480 3620, 60 3750, 280 3900
    C 450 4050, 120 4200, 300 4350
  `

  return (
    <div style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: `${svgHeight}px`,
      zIndex: 0,
      pointerEvents: "none",
      overflow: "hidden",
    }}>
      <svg
        viewBox={`0 0 500 ${svgHeight * 0.9}`}
        preserveAspectRatio="xMidYMin slice"
        style={{ width: "100%", height: "100%", opacity: 0.10 }}
      >
        <defs>
          {/* Motif herbe */}
          <pattern id="grass" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill="#4CAF50" />
            <line x1="5" y1="20" x2="6" y2="14" stroke="#388E3C" strokeWidth="1" />
            <line x1="15" y1="20" x2="14" y2="15" stroke="#388E3C" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Route — ombre */}
        <path d={roadPath} fill="none" stroke="#000" strokeWidth="58" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />

        {/* Route — asphalte */}
        <path d={roadPath} fill="none" stroke="#444" strokeWidth="52" strokeLinecap="round" strokeLinejoin="round" />

        {/* Route — bordures blanches */}
        <path ref={pathRef} d={roadPath} fill="none" stroke="#FFF" strokeWidth="55" strokeLinecap="round" strokeLinejoin="round" opacity="0" />
        <path d={roadPath} fill="none" stroke="#EEE" strokeWidth="52" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 50" />

        {/* Ligne blanche centrale */}
        <path d={roadPath} fill="none" stroke="#FFF" strokeWidth="2.5" strokeDasharray="16 12" strokeLinecap="round">
          <animate attributeName="stroke-dashoffset" values="0;-28" dur="0.8s" repeatCount="indefinite" />
        </path>

        {/* Bordures de route */}
        <path d={roadPath} fill="none" stroke="#FFF" strokeWidth="53" strokeLinecap="round" strokeLinejoin="round" opacity="0" />

        {/* Arbres le long de la route */}
        {[
          [60, 120], [380, 250], [40, 500], [420, 620],
          [80, 880], [400, 1000], [50, 1180], [430, 1350],
          [70, 1550], [380, 1700], [40, 1880], [420, 2020],
          [80, 2200], [400, 2400], [50, 2580], [430, 2750],
          [70, 2920], [380, 3100], [40, 3280], [420, 3450],
          [80, 3600], [400, 3780], [50, 3950], [430, 4100],
        ].map(([x, y], i) => {
          const size = 12 + (i % 4) * 4
          const trunkH = 15 + (i % 3) * 5
          return (
            <g key={`tree-${i}`}>
              <rect x={x - 2} y={y - trunkH} width={4} height={trunkH} rx="1" fill="#5D4037" />
              <ellipse cx={x} cy={y - trunkH - size * 0.4} rx={size} ry={size * 0.8} fill="#2E7D32" />
              <ellipse cx={x - size * 0.3} cy={y - trunkH - size * 0.2} rx={size * 0.7} ry={size * 0.6} fill="#388E3C" />
            </g>
          )
        })}

        {/* Bâtiments */}
        {[
          [440, 400, 30, 45], [20, 750, 25, 35], [450, 1150, 35, 50],
          [10, 1600, 28, 40], [440, 2050, 32, 48], [15, 2500, 25, 38],
          [450, 2900, 30, 42], [20, 3350, 35, 50], [440, 3700, 28, 40],
        ].map(([x, y, w, h], i) => (
          <g key={`building-${i}`}>
            <rect x={x} y={y - h} width={w} height={h} rx="2" fill={i % 2 === 0 ? "#78909C" : "#90A4AE"} />
            {/* Fenêtres */}
            {Array.from({ length: Math.floor(h / 14) }).map((_, j) => (
              <g key={`win-${i}-${j}`}>
                <rect x={x + 4} y={y - h + 6 + j * 14} width={6} height={6} rx="1" fill="#B0BEC5" />
                <rect x={x + w - 10} y={y - h + 6 + j * 14} width={6} height={6} rx="1" fill="#B0BEC5" />
              </g>
            ))}
          </g>
        ))}

        {/* Panneaux de signalisation */}
        {[
          [150, 300, "50"], [350, 780, "30"], [130, 1300, "A"],
          [380, 1850, "50"], [100, 2350, "30"], [400, 2850, "A"],
          [150, 3400, "50"], [370, 3900, "30"],
        ].map(([x, y, text], i) => (
          <g key={`sign-${i}`}>
            <rect x={Number(x) - 1} y={Number(y) - 30} width={3} height={30} fill="#888" />
            {text === "A" ? (
              <>
                <polygon points={`${Number(x)},${Number(y) - 52} ${Number(x) + 12},${Number(y) - 34} ${Number(x) - 12},${Number(y) - 34}`} fill="#FFF" stroke="#E53935" strokeWidth="2" />
                <text x={Number(x)} y={Number(y) - 39} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#333">!</text>
              </>
            ) : (
              <>
                <circle cx={Number(x)} cy={Number(y) - 40} r={10} fill="#FFF" stroke="#E53935" strokeWidth="2.5" />
                <text x={Number(x)} y={Number(y) - 37} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#333">{text}</text>
              </>
            )}
          </g>
        ))}

        {/* Passages piétons */}
        {[480, 1200, 2000, 2800, 3600].map((y, i) => {
          const x = 150 + (i % 2) * 150
          return (
            <g key={`zebra-${i}`}>
              {[0, 8, 16, 24, 32].map((offset, j) => (
                <rect key={j} x={x - 15 + offset} y={y - 3} width={5} height={26} rx="1" fill="#FFF" opacity="0.9" />
              ))}
            </g>
          )
        })}

        {/* Voiture auto-école qui suit le scroll */}
        <g transform={`translate(${carPos.x}, ${carPos.y}) rotate(${carPos.angle})`}>
          {/* Ombre */}
          <ellipse cx="0" cy="10" rx="22" ry="5" fill="#000" opacity="0.25" />

          {/* Carrosserie */}
          <rect x="-24" y="-8" width="48" height="18" rx="6" fill="#00B37D" />

          {/* Toit */}
          <rect x="-12" y="-18" width="26" height="12" rx="4" fill="#009966" />

          {/* Panneau auto-école */}
          <rect x="-8" y="-25" width="18" height="8" rx="3" fill="#FFF" stroke="#00B37D" strokeWidth="1" />
          <text x="1" y="-19" textAnchor="middle" fontSize="5" fontWeight="bold" fill="#00B37D">JC</text>

          {/* Pare-brise */}
          <rect x="8" y="-15" width="12" height="8" rx="2" fill="#B3E5FC" opacity="0.85" />

          {/* Vitre arrière */}
          <rect x="-16" y="-15" width="10" height="8" rx="2" fill="#B3E5FC" opacity="0.85" />

          {/* Phares avant */}
          <rect x="22" y="-3" width="4" height="5" rx="1" fill="#FFF59D" />

          {/* Feux arrière */}
          <rect x="-26" y="-2" width="3" height="4" rx="1" fill="#EF5350" />

          {/* Roues */}
          <circle cx="-12" cy="10" r="5" fill="#333" />
          <circle cx="-12" cy="10" r="2.5" fill="#777" />
          <circle cx="14" cy="10" r="5" fill="#333" />
          <circle cx="14" cy="10" r="2.5" fill="#777" />

          {/* Silhouettes */}
          <circle cx="-4" cy="-12" r="3.5" fill="#5D4037" />
          <circle cx="13" cy="-12" r="3.5" fill="#3E2723" />
        </g>
      </svg>
    </div>
  )
}
