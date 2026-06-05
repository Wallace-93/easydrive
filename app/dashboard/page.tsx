"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase-client"

export default function Dashboard() {
  const [info, setInfo] = useState("Chargement de votre espace…")

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        window.location.replace("/connexion")
        return
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("prenom, nom, role")
        .eq("id", session.user.id)
        .single()

      if (!profile) {
        window.location.replace("/connexion")
        return
      }

      setInfo(`Bienvenue, ${profile.prenom} ${profile.nom} — Rôle : ${profile.role}`)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--color-background)" }}>
      <h1 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>Tableau de bord</h1>
      <p className="text-base mb-8" style={{ color: "var(--color-primary)" }}>{info}</p>
      <button
        onClick={() => {
          const supabase = createClient()
          supabase.auth.signOut().then(() => window.location.replace("/connexion"))
        }}
        className="text-sm font-medium px-6 py-3 rounded-xl"
        style={{ background: "var(--color-error-light)", color: "var(--color-error)", border: "none", cursor: "pointer" }}
      >
        Se déconnecter
      </button>
    </div>
  )
}
