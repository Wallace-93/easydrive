"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import Link from "next/link"
import { Car } from "lucide-react"

type Vehicule = {
  id: string
  user_id: string
  marque: string
  modele: string
  annee: number
  type_boite: string
  carburant: string
  tarif_journalier: number
  tarif_horaire: number | null
  ville: string
  description: string
  disponible: boolean
  photo_url: string | null
  created_at: string
  profiles: {
    prenom: string
    nom: string
  } | null
}

const BOITE_LABELS: Record<string, string> = {
  manuelle: "Manuelle",
  automatique: "Automatique",
}

export default function Vehicules() {
  const [vehicules, setVehicules] = useState<Vehicule[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isMoniteur, setIsMoniteur] = useState(false)
  const [filtreBoite, setFiltreBoite] = useState("")
  const [recherche, setRecherche] = useState("")

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      if (data.session?.user) {
        supabase.from("profiles").select("role").eq("id", data.session.user.id).single()
          .then(({ data: p }) => { if (p?.role === "moniteur") setIsMoniteur(true) })
      }
    })

    fetchVehicules()

    async function fetchVehicules() {
      try {
        const { data, error } = await supabase
          .from("vehicules")
          .select("*, profiles:user_id (prenom, nom)")
          .eq("disponible", true)
          .order("created_at", { ascending: false })

        if (error) throw error
        setVehicules(data || [])
      } catch (err) {
        console.error("Erreur chargement véhicules :", err)
      } finally {
        setLoading(false)
      }
    }
  }, [])

  const vehiculesFiltres = vehicules.filter(v => {
    if (filtreBoite && v.type_boite !== filtreBoite) return false
    if (recherche) {
      const q = recherche.toLowerCase()
      const texte = `${v.marque} ${v.modele} ${v.ville}`.toLowerCase()
      if (!texte.includes(q)) return false
    }
    return true
  })

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      <header className="border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-1" style={{ fontFamily: "var(--font-display)", textDecoration: "none" }}>
            <span className="text-xl font-extrabold" style={{ color: "var(--color-primary)" }}>Just</span>
            <span className="text-xl font-light" style={{ color: "var(--color-text)" }}>Conduite</span>
          </Link>
          <div className="flex items-center gap-3">
            {isMoniteur && (
              <Link href="/vehicules/ajouter" className="btn-primary text-sm" style={{ textDecoration: "none", padding: "10px 20px" }}>
                + Proposer un véhicule
              </Link>
            )}
            {user ? (
              <Link href="/dashboard" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>Mon espace</Link>
            ) : (
              <Link href="/connexion" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>Se connecter</Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-semibold"
            style={{ background: "var(--color-primary-light)", color: "var(--color-primary-dark)" }}>
            🚗 Véhicules à double commande
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Location de véhicules <span style={{ color: "var(--color-primary)" }}>double commande</span>
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--color-text-secondary)" }}>
            Louez un véhicule équipé pour vos leçons de conduite. Idéal pour les moniteurs indépendants.
          </p>
        </div>

        {/* Filtres */}
        <div className="rounded-2xl p-4 sm:p-6 mb-8" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <div className="flex flex-wrap gap-3">
            <input type="text" placeholder="Rechercher par marque, modèle ou ville…" value={recherche}
              onChange={e => setRecherche(e.target.value)} className="input-field" style={{ flex: 1, minWidth: 200 }} />
            <select value={filtreBoite} onChange={e => setFiltreBoite(e.target.value)} className="input-field" style={{ maxWidth: 200 }}>
              <option value="">Toutes les boîtes</option>
              <option value="manuelle">Manuelle</option>
              <option value="automatique">Automatique</option>
            </select>
          </div>
        </div>

        {/* Résultats */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="animate-spin mb-3" style={{ color: "var(--color-primary)", width: 32, height: 32 }} fill="none" viewBox="0 0 24 24">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : vehiculesFiltres.length === 0 ? (
          <div className="text-center py-20">
            <Car size={32} style={{ color: "var(--color-text-muted)", margin: "0 auto 12px" }} />
            <p className="text-lg font-semibold mb-2">Aucun véhicule disponible</p>
            <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
              {vehicules.length === 0
                ? "Aucun véhicule n'est encore proposé à la location."
                : "Essayez de modifier vos filtres."
              }
            </p>
            {isMoniteur && (
              <Link href="/vehicules/ajouter" className="btn-primary inline-block" style={{ textDecoration: "none" }}>
                Proposer un véhicule
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vehiculesFiltres.map(v => (
              <Link key={v.id} href={`/vehicules/${v.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="rounded-2xl overflow-hidden transition-all" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--color-primary)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,179,125,0.1)" }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.boxShadow = "none" }}>
                  {/* Photo placeholder */}
                  <div className="h-40 flex items-center justify-center" style={{ background: "var(--color-surface-hover)" }}>
                    {v.photo_url ? (
                      <img src={v.photo_url} alt={`${v.marque} ${v.modele}`} className="w-full h-40 object-cover" />
                    ) : (
                      <Car size={36} style={{ color: "var(--color-text-muted)" }} />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-bold">{v.marque} {v.modele}</h3>
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                          {v.annee} · {BOITE_LABELS[v.type_boite] || v.type_boite} · {v.carburant}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs mt-2" style={{ color: "var(--color-text-muted)" }}>📍 {v.ville}</p>
                    <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid var(--color-border)" }}>
                      <span className="text-lg font-bold" style={{ color: "var(--color-primary)" }}>
                        {v.tarif_journalier} €<span className="text-xs font-normal">/jour</span>
                      </span>
                      {v.tarif_horaire && (
                        <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                          ou {v.tarif_horaire} €/h
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-2" style={{ color: "var(--color-text-muted)" }}>
                      Proposé par {v.profiles?.prenom} {v.profiles?.nom?.[0]}.
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
