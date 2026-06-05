"use client"

import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--color-background)" }}>
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4" style={{ fontFamily: "var(--font-display)" }}>
          <span style={{ color: "var(--color-primary)" }}>Easy</span>
          <span style={{ color: "var(--color-text)" }}> Drive</span>
        </h1>
        <p className="text-lg mb-8" style={{ color: "var(--color-text-secondary)", maxWidth: 480 }}>
          Trouvez votre moniteur idéal en Île-de-France. Commission la plus basse du marché, suivi personnalisé, code gratuit.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/inscription" className="btn-primary text-center" style={{ textDecoration: "none" }}>
            Créer mon compte
          </Link>
          <Link
            href="/connexion"
            className="text-center font-semibold text-sm px-7 py-3.5 rounded-xl transition-colors"
            style={{ background: "var(--color-surface)", border: "1.5px solid var(--color-border)", color: "var(--color-text)", textDecoration: "none" }}
          >
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  )
}
