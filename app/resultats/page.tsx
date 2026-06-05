"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import Link from "next/link"

const ZONES_LABELS: Record<string, string> = {
  paris: "Paris",
  hauts_de_seine: "Hauts-de-Seine (92)",
  seine_saint_denis: "Seine-Saint-Denis (93)",
  val_de_marne: "Val-de-Marne (94)",
  yvelines: "Yvelines (78)",
  essonne: "Essonne (91)",
  val_d_oise: "Val-d'Oise (95)",
  seine_et_marne: "Seine-et-Marne (77)",
}

const SPECIALITES_LABELS: Record<string, string> = {
  conduite_accompagnee: "Conduite accompagnée",
  conduite_supervisee: "Conduite supervisée",
  perfectionnement: "Perfectionnement",
  remise_a_niveau: "Remise à niveau",
  anxiete: "Gestion du stress",
  autoroute: "Autoroute",
  handicap: "Handicap",
  preparation_examen: "Préparation examen",
}

type Moniteur = {
  id: string
  user_id: string
  diplome: string
  specialites: string[]
  tarif_horaire: number
  zone: string
  ville_principale: string
  lieux_supplementaires: string[]
  rayon_km: number
  boite_auto: boolean
  type_boite: string
  bio: string
  experience_annees: number
  verifie: boolean
  note_moyenne: number
  nb_avis: number
  profiles: {
    prenom: string
    nom: string
    avatar_url: string | null
  }
}

export default function Resultats() {
  const [moniteurs, setMoniteurs] = useState<Moniteur[]>([])
  const [loading, setLoading] = useState(true)
  const [filtreZone, setFiltreZone] = useState("")
  const [filtreBoite, setFiltreBoite] = useState("")
  const [filtrePrixMax, setFiltrePrixMax] = useState("")
  const [recherche, setRecherche] = useState("")

  useEffect(() => {
    fetchMoniteurs()
  }, [])

  async function fetchMoniteurs() {
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from("moniteurs")
        .select("*, profiles (prenom, nom, avatar_url)")
        .eq("verifie", true)
        .order("note_moyenne", { ascending: false })

      if (error) throw error
      setMoniteurs(data || [])
    } catch (err) {
      console.error("Erreur chargement moniteurs :", err)
    } finally {
      setLoading(false)
    }
  }

  const moniteursFiltres = moniteurs.filter(m => {
    if (filtreZone && m.zone !== filtreZone) return false
    if (filtreBoite === "automatique" && !m.boite_auto) return false
    if (filtreBoite === "manuelle" && m.type_boite === "automatique") return false
    if (filtrePrixMax && m.tarif_horaire > parseInt(filtrePrixMax)) return false
    if (recherche) {
      const q = recherche.toLowerCase()
      const nom = `${m.profiles.prenom} ${m.profiles.nom}`.toLowerCase()
      const ville = (m.ville_principale || "").toLowerCase()
      const lieux = (m.lieux_supplementaires || []).join(" ").toLowerCase()
      if (!nom.includes(q) && !ville.includes(q) && !lieux.includes(q) && !m.zone.includes(q)) return false
    }
    return true
  })

  function getInitiales(prenom: string, nom: string) {
    return (prenom[0] || "").toUpperCase() + (nom[0] || "").toUpperCase()
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      {/* En-tête */}
      <header className="border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-1" style={{ fontFamily: "var(--font-display)", textDecoration: "none" }}>
            <span className="text-xl font-extrabold" style={{ color: "var(--color-primary)" }}>Easy</span>
            <span className="text-xl font-light" style={{ color: "var(--color-text)" }}>Drive</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/connexion" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>Se connecter</Link>
            <Link href="/inscription" className="btn-primary text-sm" style={{ textDecoration: "none", padding: "10px 20px" }}>S'inscrire</Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Titre */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Trouvez votre moniteur en <span style={{ color: "var(--color-primary)" }}>Île-de-France</span>
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--color-text-secondary)" }}>
          {moniteurs.length} moniteur{moniteurs.length > 1 ? "s" : ""} vérifié{moniteurs.length > 1 ? "s" : ""} disponible{moniteurs.length > 1 ? "s" : ""}
        </p>

        {/* Barre de recherche + filtres */}
        <div className="rounded-2xl p-4 sm:p-6 mb-8" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <div className="mb-4">
            <input type="text" placeholder="Rechercher par nom, ville ou lieu…" value={recherche}
              onChange={e => setRecherche(e.target.value)} className="input-field" />
          </div>
          <div className="flex flex-wrap gap-3">
            <select value={filtreZone} onChange={e => setFiltreZone(e.target.value)} className="input-field" style={{ maxWidth: 220 }}>
              <option value="">Toutes les zones</option>
              {Object.entries(ZONES_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <select value={filtreBoite} onChange={e => setFiltreBoite(e.target.value)} className="input-field" style={{ maxWidth: 200 }}>
              <option value="">Toutes les boîtes</option>
              <option value="manuelle">Boîte manuelle</option>
              <option value="automatique">Boîte automatique</option>
            </select>
            <select value={filtrePrixMax} onChange={e => setFiltrePrixMax(e.target.value)} className="input-field" style={{ maxWidth: 180 }}>
              <option value="">Tous les prix</option>
              <option value="35">Jusqu'à 35 €/h</option>
              <option value="40">Jusqu'à 40 €/h</option>
              <option value="50">Jusqu'à 50 €/h</option>
              <option value="60">Jusqu'à 60 €/h</option>
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
            <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Chargement des moniteurs…</span>
          </div>
        ) : moniteursFiltres.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg font-semibold mb-2">Aucun moniteur trouvé</p>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              {moniteurs.length === 0
                ? "Aucun moniteur vérifié n'est encore inscrit. Revenez bientôt !"
                : "Essayez de modifier vos filtres pour élargir la recherche."
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {moniteursFiltres.map(m => (
              <Link key={m.id} href={`/moniteur/${m.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="rounded-2xl p-5 transition-all" style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--color-primary)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,179,125,0.1)" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.boxShadow = "none" }}>
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-bold"
                      style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>
                      {m.profiles.avatar_url
                        ? <img src={m.profiles.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover" />
                        : getInitiales(m.profiles.prenom, m.profiles.nom)
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Nom + tarif */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold">{m.profiles.prenom} {m.profiles.nom}</h3>
                        <span className="text-sm font-bold flex-shrink-0" style={{ color: "var(--color-primary)" }}>
                          {m.tarif_horaire} €/h
                        </span>
                      </div>

                      {/* Zone + expérience */}
                      <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                        {ZONES_LABELS[m.zone] || m.zone}
                        {m.ville_principale && ` · ${m.ville_principale}`}
                        {m.experience_annees > 0 && ` · ${m.experience_annees} an${m.experience_annees > 1 ? "s" : ""} d'exp.`}
                      </p>

                      {/* Lieux supplémentaires */}
                      {m.lieux_supplementaires && m.lieux_supplementaires.length > 0 && (
                        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                          Aussi disponible à : {m.lieux_supplementaires.join(", ")}
                        </p>
                      )}

                      {/* Note */}
                      <div className="flex items-center gap-1 mt-2">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} width="14" height="14" fill={i < Math.floor(m.note_moyenne) ? "#F59E0B" : "none"} viewBox="0 0 24 24"
                            stroke="#F59E0B" strokeWidth="2">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                          </svg>
                        ))}
                        <span className="text-xs ml-1" style={{ color: "var(--color-text-muted)" }}>
                          {m.note_moyenne > 0 ? `${m.note_moyenne.toFixed(1)} (${m.nb_avis} avis)` : "Nouveau"}
                        </span>
                      </div>

                      {/* Spécialités */}
                      {m.specialites && m.specialites.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {m.specialites.slice(0, 3).map(s => (
                            <span key={s} className="text-xs px-2.5 py-1 rounded-full"
                              style={{ background: "var(--color-primary-light)", color: "var(--color-primary-dark)", fontWeight: 500 }}>
                              {SPECIALITES_LABELS[s] || s}
                            </span>
                          ))}
                          {m.specialites.length > 3 && (
                            <span className="text-xs px-2.5 py-1 rounded-full"
                              style={{ background: "var(--color-surface-hover)", color: "var(--color-text-muted)" }}>
                              +{m.specialites.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
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
