"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect, use } from "react"
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
  profiles: {
    prenom: string
    nom: string
    telephone: string
  } | null
}

export default function DetailVehicule({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [vehicule, setVehicule] = useState<Vehicule | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [contactVisible, setContactVisible] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))

      const { data, error } = await supabase
        .from("vehicules")
        .select("*, profiles:user_id (prenom, nom, telephone)")
        .eq("id", id)
        .single()

      if (error || !data) {
        setNotFound(true)
      } else {
        setVehicule(data)
      }
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-background)" }}>
        <svg className="animate-spin" style={{ color: "var(--color-primary)", width: 32, height: 32 }} fill="none" viewBox="0 0 24 24">
          <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  if (notFound || !vehicule) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--color-background)" }}>
        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>Véhicule introuvable</h1>
        <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>Cette annonce n'existe plus ou a été retirée.</p>
        <Link href="/vehicules" className="btn-primary" style={{ textDecoration: "none" }}>Voir tous les véhicules</Link>
      </div>
    )
  }

  const v = vehicule

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      <header className="border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-1" style={{ fontFamily: "var(--font-display)", textDecoration: "none" }}>
            <span className="text-xl font-extrabold" style={{ color: "var(--color-primary)" }}>Just</span>
            <span className="text-xl font-light" style={{ color: "var(--color-text)" }}>Conduite</span>
          </Link>
          <Link href="/vehicules" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>← Tous les véhicules</Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Photo */}
        <div className="rounded-2xl overflow-hidden mb-6 h-56 sm:h-72 flex items-center justify-center" style={{ background: "var(--color-surface-hover)" }}>
          {v.photo_url ? (
            <img src={v.photo_url} alt={`${v.marque} ${v.modele}`} className="w-full h-full object-cover" />
          ) : (
            <Car size={56} style={{ color: "var(--color-text-muted)" }} />
          )}
        </div>

        {/* Infos principales */}
        <div className="rounded-2xl p-6 sm:p-8 mb-6" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                {v.marque} {v.modele}
              </h1>
              <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                {v.annee} · {v.type_boite === "manuelle" ? "Boîte manuelle" : "Boîte automatique"} · {v.carburant.charAt(0).toUpperCase() + v.carburant.slice(1)}
              </p>
              <p className="text-sm mt-2" style={{ color: "var(--color-text-muted)" }}>📍 {v.ville}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="inline-flex items-baseline gap-1 px-5 py-3 rounded-xl" style={{ background: "var(--color-primary-light)" }}>
                <span className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>{v.tarif_journalier} €</span>
                <span className="text-sm" style={{ color: "var(--color-primary-dark)" }}>/jour</span>
              </div>
              {v.tarif_horaire && (
                <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>ou {v.tarif_horaire} €/heure</span>
              )}
            </div>
          </div>

          {v.description && (
            <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--color-border)" }}>
              <h2 className="text-sm font-bold mb-2">Description</h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{v.description}</p>
            </div>
          )}
        </div>

        {/* Détails */}
        <div className="grid sm:grid-cols-2 gap-6 mb-6">
          <div className="rounded-2xl p-6" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
              <span>🔧</span> Caractéristiques
            </h2>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <span style={{ color: "var(--color-text-muted)" }}>Marque</span>
                <span className="font-medium">{v.marque}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--color-text-muted)" }}>Modèle</span>
                <span className="font-medium">{v.modele}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--color-text-muted)" }}>Année</span>
                <span className="font-medium">{v.annee}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--color-text-muted)" }}>Transmission</span>
                <span className="font-medium">{v.type_boite === "manuelle" ? "Manuelle" : "Automatique"}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--color-text-muted)" }}>Carburant</span>
                <span className="font-medium">{v.carburant.charAt(0).toUpperCase() + v.carburant.slice(1)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
              <span>👤</span> Propriétaire
            </h2>
            <p className="text-base font-semibold">{v.profiles?.prenom} {v.profiles?.nom}</p>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>Moniteur sur Just Conduite</p>

            {!contactVisible ? (
              <button onClick={() => { if (user) setContactVisible(true); else window.location.replace("/connexion") }}
                className="btn-primary w-full mt-4 text-sm">
                Afficher les coordonnées
              </button>
            ) : (
              <div className="mt-4 p-4 rounded-xl" style={{ background: "var(--color-primary-light)" }}>
                <p className="text-sm font-semibold" style={{ color: "var(--color-primary-dark)" }}>
                  📞 {v.profiles?.telephone || "Non renseigné"}
                </p>
                <p className="text-xs mt-2" style={{ color: "var(--color-primary)" }}>
                  Contactez {v.profiles?.prenom} directement pour organiser la location.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Infos légales */}
        <div className="rounded-xl p-4 text-xs" style={{ background: "var(--color-surface-hover)", color: "var(--color-text-muted)" }}>
          <p className="font-semibold mb-1">Information importante</p>
          <p>La location de véhicule à double commande est un accord entre le propriétaire et le locataire. Assurez-vous que le véhicule est couvert par une assurance adaptée à l'enseignement de la conduite.</p>
        </div>
      </div>
    </div>
  )
}
