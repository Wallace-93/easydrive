"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect, use } from "react"
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
  conduite_accompagnee: "Conduite accompagnée (AAC)",
  conduite_supervisee: "Conduite supervisée",
  perfectionnement: "Perfectionnement",
  remise_a_niveau: "Remise à niveau",
  anxiete: "Gestion du stress au volant",
  autoroute: "Conduite sur autoroute",
  handicap: "Adaptation handicap",
  preparation_examen: "Préparation à l'examen",
}

const CRENEAUX_LABELS: Record<string, string> = {
  matin: "Matin (8h — 12h)",
  midi: "Midi (12h — 14h)",
  apres_midi: "Après-midi (14h — 18h)",
  soir: "Soir (18h — 21h)",
  week_end: "Week-end",
}

const BOITE_LABELS: Record<string, string> = {
  manuelle: "Boîte manuelle",
  automatique: "Boîte automatique",
  les_deux: "Manuelle et automatique",
}

type Moniteur = {
  id: string
  user_id: string
  diplome: string
  experience_annees: number
  specialites: string[]
  tarif_horaire: number
  zone: string
  ville_principale: string
  lieux_supplementaires: string[]
  rayon_km: number
  boite_auto: boolean
  type_boite: string
  bio: string
  verifie: boolean
  note_moyenne: number
  nb_avis: number
  creneaux: string[]
  profiles: {
    prenom: string
    nom: string
    avatar_url: string | null
    telephone: string
  }
}

type Avis = {
  id: string
  note: number
  commentaire: string
  created_at: string
  eleves: {
    user_id: string
    profiles: {
      prenom: string
      nom: string
    }
  } | null
}

export default function ProfilMoniteur({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [moniteur, setMoniteur] = useState<Moniteur | null>(null)
  const [avis, setAvis] = useState<Avis[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      const { data: m, error } = await supabase
        .from("moniteurs")
        .select("*, profiles (prenom, nom, avatar_url, telephone)")
        .eq("id", id)
        .single()

      if (error || !m) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setMoniteur(m)

      const { data: avisData } = await supabase
        .from("avis")
        .select("*, eleves (user_id, profiles:user_id (prenom, nom))")
        .eq("moniteur_id", id)
        .order("created_at", { ascending: false })

      setAvis(avisData || [])
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

  if (notFound || !moniteur) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--color-background)" }}>
        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>Moniteur introuvable</h1>
        <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>Ce profil n'existe pas ou a été supprimé.</p>
        <Link href="/resultats" className="btn-primary" style={{ textDecoration: "none" }}>Voir tous les moniteurs</Link>
      </div>
    )
  }

  const m = moniteur
  const initiales = (m.profiles.prenom[0] || "").toUpperCase() + (m.profiles.nom[0] || "").toUpperCase()
  const tousLieux = [m.ville_principale, ...(m.lieux_supplementaires || [])].filter(Boolean)
  const commission = Math.round(m.tarif_horaire * 0.15)
  const revenus = m.tarif_horaire - commission

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      {/* En-tête */}
      <header className="border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-1" style={{ fontFamily: "var(--font-display)", textDecoration: "none" }}>
            <span className="text-xl font-extrabold" style={{ color: "var(--color-primary)" }}>Just</span>
            <span className="text-xl font-light" style={{ color: "var(--color-text)" }}>Conduite</span>
          </Link>
          <Link href="/resultats" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>
            ← Tous les moniteurs
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Carte principale */}
        <div className="rounded-2xl p-6 sm:p-8 mb-6" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center flex-shrink-0 text-2xl font-bold"
              style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>
              {m.profiles.avatar_url
                ? <img src={m.profiles.avatar_url} alt="" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover" />
                : initiales
              }
            </div>

            <div className="flex-1">
              {/* Nom */}
              <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                {m.profiles.prenom} {m.profiles.nom}
              </h1>

              {/* Zone + expérience */}
              <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                {ZONES_LABELS[m.zone] || m.zone}
                {m.experience_annees > 0 && ` · ${m.experience_annees} an${m.experience_annees > 1 ? "s" : ""} d'expérience`}
                {` · ${m.diplome}`}
              </p>

              {/* Note */}
              <div className="flex items-center gap-1.5 mt-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="18" height="18" fill={i < Math.floor(m.note_moyenne) ? "#F59E0B" : "none"}
                    viewBox="0 0 24 24" stroke="#F59E0B" strokeWidth="2">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                ))}
                <span className="text-sm font-medium ml-1" style={{ color: "var(--color-text-secondary)" }}>
                  {m.note_moyenne > 0 ? `${m.note_moyenne.toFixed(1)} (${m.nb_avis} avis)` : "Aucun avis pour le moment"}
                </span>
              </div>

              {/* Tarif */}
              <div className="mt-4 inline-flex items-baseline gap-1 px-4 py-2 rounded-xl" style={{ background: "var(--color-primary-light)" }}>
                <span className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>{m.tarif_horaire} €</span>
                <span className="text-sm" style={{ color: "var(--color-primary-dark)" }}>/heure</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          {m.bio && (
            <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--color-border)" }}>
              <h2 className="text-sm font-bold mb-2">À propos</h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{m.bio}</p>
            </div>
          )}

          {/* CTA */}
          <div className="mt-6 pt-6" style={{ borderTop: "1px solid var(--color-border)" }}>
            <Link href={`/reserver/${m.id}`} className="btn-primary w-full text-center block" style={{ textDecoration: "none" }}>
              Réserver une leçon avec {m.profiles.prenom}
            </Link>
          </div>
        </div>

        {/* Informations détaillées */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Lieux */}
          <div className="rounded-2xl p-6" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--color-primary)" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Lieux de prise en charge
            </h2>
            <div className="flex flex-col gap-2">
              {tousLieux.map((lieu, i) => (
                <div key={i} className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: i === 0 ? "var(--color-primary)" : "var(--color-border)" }} />
                  {lieu} {i === 0 && <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>(principal)</span>}
                </div>
              ))}
            </div>
            <p className="text-xs mt-3" style={{ color: "var(--color-text-muted)" }}>
              Rayon de déplacement : {m.rayon_km} km
            </p>
          </div>

          {/* Disponibilités */}
          <div className="rounded-2xl p-6" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--color-primary)" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Disponibilités
            </h2>
            <div className="flex flex-wrap gap-2">
              {(m.creneaux || []).map(c => (
                <span key={c} className="text-xs px-3 py-1.5 rounded-full font-medium"
                  style={{ background: "var(--color-primary-light)", color: "var(--color-primary-dark)" }}>
                  {CRENEAUX_LABELS[c] || c}
                </span>
              ))}
              {(!m.creneaux || m.creneaux.length === 0) && (
                <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Non renseignées</span>
              )}
            </div>
          </div>

          {/* Spécialités */}
          <div className="rounded-2xl p-6" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--color-primary)" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Spécialités
            </h2>
            <div className="flex flex-wrap gap-2">
              {(m.specialites || []).map(s => (
                <span key={s} className="text-xs px-3 py-1.5 rounded-full font-medium"
                  style={{ background: "var(--color-surface-hover)", color: "var(--color-text-secondary)" }}>
                  {SPECIALITES_LABELS[s] || s}
                </span>
              ))}
              {(!m.specialites || m.specialites.length === 0) && (
                <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Aucune spécialité renseignée</span>
              )}
            </div>
          </div>

          {/* Véhicule */}
          <div className="rounded-2xl p-6" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="var(--color-primary)" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10m10 0h4m0 0l3-3m-3 3l-3-3" />
              </svg>
              Véhicule
            </h2>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              {BOITE_LABELS[m.type_boite] || "Non renseigné"}
            </p>
          </div>
        </div>

        {/* Avis */}
        <div className="rounded-2xl p-6 sm:p-8 mt-6" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <h2 className="text-lg font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>
            Avis des élèves
            {avis.length > 0 && <span className="text-sm font-normal ml-2" style={{ color: "var(--color-text-muted)" }}>({avis.length})</span>}
          </h2>

          {avis.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Aucun avis pour le moment. Soyez le premier à évaluer {m.profiles.prenom} !
            </p>
          ) : (
            <div className="flex flex-col gap-5">
              {avis.map(a => (
                <div key={a.id} className="pb-5" style={{ borderBottom: "1px solid var(--color-border)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {a.eleves?.profiles?.prenom || "Élève"} {a.eleves?.profiles?.nom?.[0] || ""}.
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} width="12" height="12" fill={i < a.note ? "#F59E0B" : "none"}
                            viewBox="0 0 24 24" stroke="#F59E0B" strokeWidth="2">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {new Date(a.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                  {a.commentaire && (
                    <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{a.commentaire}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA bas de page */}
        <div className="mt-6 text-center">
          <Link href={`/reserver/${m.id}`} className="btn-primary inline-block" style={{ textDecoration: "none" }}>
            Réserver une leçon avec {m.profiles.prenom} →
          </Link>
        </div>
      </div>
    </div>
  )
}
