"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import Link from "next/link"

type Moniteur = {
  id: string
  user_id: string
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
  creneaux: string[]
  note_moyenne: number
  nb_avis: number
  profiles: {
    prenom: string
    nom: string
    avatar_url: string | null
  } | null
}

type AvisData = {
  moniteur_id: string
  note: number
  commentaire: string
}

type EleveData = {
  type_permis: string
  type_boite: string
  niveau: string
  situation: string
  ville_principale: string
  rayon_km: number
  budget: string
  creneaux: string[]
  besoins: string[]
}

type Match = {
  moniteur: Moniteur
  score: number
  raisons: string[]
}

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

const BUDGET_MAX: Record<string, number> = {
  moins_30: 30,
  "30_40": 40,
  "40_50": 50,
  plus_50: 999,
  indifferent: 999,
}

// Mots-clés dans les avis associés aux besoins des élèves
const MOTS_CLES_AVIS: Record<string, string[]> = {
  anxiete: ["patient", "patiente", "patience", "calme", "rassurant", "rassurante", "confiance", "zen", "doux", "douce", "bienveillant", "bienveillante", "stress", "à l'aise", "serein"],
  conduite_accompagnee: ["accompagnée", "aac", "jeune", "adolescent", "15 ans", "parents", "pédagogue"],
  autoroute: ["autoroute", "voie rapide", "périphérique", "nationale", "vitesse", "insertion"],
  preparation_examen: ["examen", "réussi", "première fois", "premier passage", "bien préparé", "préparée", "jour j", "inspecteur"],
  perfectionnement: ["perfectionnement", "niveau", "progresser", "améliorer", "confiant", "autonome", "maîtrise"],
  handicap: ["handicap", "adapté", "adaptée", "pmr", "aménagement", "accessible"],
  remise_a_niveau: ["reprise", "longtemps", "rouillé", "rappel", "bases", "reprendre"],
  conduite_supervisee: ["supervisée", "supervisé", "accompagnement", "suivi"],
}

function calculerMatch(eleve: EleveData, moniteur: Moniteur, avisMoniteur: AvisData[]): Match {
  let score = 0
  const raisons: string[] = []

  // 1. Compatibilité boîte de vitesses (éliminatoire sinon bonus)
  if (eleve.type_boite && eleve.type_boite !== "indifferent") {
    if (moniteur.type_boite === "les_deux") {
      score += 10
      raisons.push("Propose les deux types de boîte de vitesses")
    } else if (moniteur.type_boite === eleve.type_boite) {
      score += 10
    } else {
      score -= 50 // pénalité forte si incompatible
    }
  }

  // 2. Correspondance des spécialités avec les besoins
  const besoinsTrouves: string[] = []
  for (const besoin of eleve.besoins) {
    if (moniteur.specialites.includes(besoin)) {
      score += 15
      besoinsTrouves.push(SPECIALITES_LABELS[besoin] || besoin)
    }
  }
  if (besoinsTrouves.length > 0) {
    raisons.push(`Spécialisé(e) en : ${besoinsTrouves.join(", ")}`)
  }

  // 3. Compatibilité des créneaux
  const creneauxCommuns = eleve.creneaux.filter(c => moniteur.creneaux.includes(c))
  if (creneauxCommuns.length > 0) {
    score += creneauxCommuns.length * 5
    if (creneauxCommuns.length >= 3) {
      raisons.push("Grande flexibilité horaire en commun")
    } else {
      raisons.push(`${creneauxCommuns.length} créneau${creneauxCommuns.length > 1 ? "x" : ""} horaire${creneauxCommuns.length > 1 ? "s" : ""} en commun`)
    }
  }

  // 4. Budget
  const budgetMax = BUDGET_MAX[eleve.budget] || 999
  if (moniteur.tarif_horaire <= budgetMax) {
    score += 10
    if (moniteur.tarif_horaire <= budgetMax - 10) {
      raisons.push(`Tarif avantageux : ${moniteur.tarif_horaire} €/h`)
    }
  } else {
    score -= 20
  }

  // 5. Note moyenne (pondérée par le nombre d'avis)
  if (moniteur.nb_avis >= 5) {
    const bonus = Math.round((moniteur.note_moyenne - 3) * 10)
    score += bonus
    if (moniteur.note_moyenne >= 4.5) {
      raisons.push(`Excellente réputation : ${moniteur.note_moyenne.toFixed(1)}/5 (${moniteur.nb_avis} avis)`)
    } else if (moniteur.note_moyenne >= 4.0) {
      raisons.push(`Très bien noté(e) : ${moniteur.note_moyenne.toFixed(1)}/5 (${moniteur.nb_avis} avis)`)
    }
  } else if (moniteur.nb_avis > 0) {
    score += Math.round((moniteur.note_moyenne - 3) * 5)
  }

  // 6. Analyse des avis en fonction des besoins de l'élève
  const avisPositifs: string[] = []
  for (const besoin of eleve.besoins) {
    const motsCles = MOTS_CLES_AVIS[besoin] || []
    let mentionsTrouvees = 0

    for (const avis of avisMoniteur) {
      if (avis.note >= 4) {
        const texte = avis.commentaire.toLowerCase()
        for (const mot of motsCles) {
          if (texte.includes(mot)) {
            mentionsTrouvees++
            break
          }
        }
      }
    }

    if (mentionsTrouvees >= 2) {
      score += 12
      const label = SPECIALITES_LABELS[besoin] || besoin
      avisPositifs.push(label.toLowerCase())
    } else if (mentionsTrouvees === 1) {
      score += 6
    }
  }

  if (avisPositifs.length > 0) {
    raisons.push(`Les élèves saluent : ${avisPositifs.join(", ")}`)
  }

  // 7. Expérience
  if (moniteur.experience_annees >= 10) {
    score += 8
    raisons.push(`${moniteur.experience_annees} ans d'expérience`)
  } else if (moniteur.experience_annees >= 5) {
    score += 5
  }

  // 8. Niveau de l'élève → expérience du moniteur
  if (eleve.niveau === "debutant" && moniteur.experience_annees >= 5) {
    score += 5
  }
  if (eleve.niveau === "echec_examen" && moniteur.specialites.includes("preparation_examen")) {
    score += 10
    if (!raisons.some(r => r.includes("examen"))) {
      raisons.push("Spécialiste de la préparation à l'examen")
    }
  }
  if (eleve.niveau === "reprise" && moniteur.specialites.includes("remise_a_niveau")) {
    score += 10
  }

  return { moniteur, score, raisons }
}

export default function Matching() {
  const [loading, setLoading] = useState(true)
  const [analysing, setAnalysing] = useState(false)
  const [matches, setMatches] = useState<Match[]>([])
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

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
        .select("role")
        .eq("id", session.user.id)
        .single()

      if (profile?.role !== "eleve") {
        setError("Cette fonctionnalité est réservée aux élèves.")
        setLoading(false)
        return
      }

      const { data: eleve } = await supabase
        .from("eleves")
        .select("*")
        .eq("user_id", session.user.id)
        .single()

      if (!eleve) {
        setError("Profil élève introuvable.")
        setLoading(false)
        return
      }

      setLoading(false)
      setAnalysing(true)

      // Charger tous les moniteurs vérifiés
      const { data: moniteurs } = await supabase
        .from("moniteurs")
        .select("*, profiles:user_id (prenom, nom, avatar_url)")
        .eq("verifie", true)

      if (!moniteurs || moniteurs.length === 0) {
        setError("Aucun moniteur disponible pour le moment.")
        setAnalysing(false)
        return
      }

      // Charger tous les avis
      const { data: tousAvis } = await supabase
        .from("avis")
        .select("moniteur_id, note, commentaire")

      const avisParMoniteur: Record<string, AvisData[]> = {}
      for (const a of (tousAvis || [])) {
        if (!avisParMoniteur[a.moniteur_id]) avisParMoniteur[a.moniteur_id] = []
        avisParMoniteur[a.moniteur_id].push(a)
      }

      // Calculer le score de chaque moniteur
      const eleveData: EleveData = {
        type_permis: eleve.type_permis || "B",
        type_boite: eleve.type_boite || "",
        niveau: eleve.niveau || "",
        situation: eleve.situation || "",
        ville_principale: eleve.ville_principale || "",
        rayon_km: eleve.rayon_km || 15,
        budget: eleve.budget || "indifferent",
        creneaux: eleve.creneaux || [],
        besoins: eleve.besoins || [],
      }

      const resultats = moniteurs
        .map(m => calculerMatch(eleveData, m, avisParMoniteur[m.id] || []))
        .filter(m => m.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)

      // Pause artificielle pour l'effet d'analyse
      await new Promise(r => setTimeout(r, 1500))

      setMatches(resultats)
      setAnalysing(false)
      setDone(true)
    }
    load()
  }, [])

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

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--color-background)" }}>
        <p className="text-lg font-semibold mb-2">{error}</p>
        <Link href="/dashboard" className="btn-primary mt-4" style={{ textDecoration: "none" }}>Retour au tableau de bord</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      <header className="border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-1" style={{ fontFamily: "var(--font-display)", textDecoration: "none" }}>
            <span className="text-xl font-extrabold" style={{ color: "var(--color-primary)" }}>Easy</span>
            <span className="text-xl font-light" style={{ color: "var(--color-text)" }}>Drive</span>
          </Link>
          <Link href="/dashboard" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>
            ← Tableau de bord
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-semibold"
            style={{ background: "var(--color-primary-light)", color: "var(--color-primary-dark)" }}>
            ✨ Recommandation personnalisée
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-3" style={{ fontFamily: "var(--font-display)" }}>
            Votre moniteur idéal
          </h1>
          <p className="text-sm max-w-lg mx-auto" style={{ color: "var(--color-text-secondary)" }}>
            Notre algorithme analyse vos besoins, vos disponibilités et les retours des élèves pour vous recommander les moniteurs les plus adaptés.
          </p>
        </div>

        {/* Animation d'analyse */}
        {analysing && (
          <div className="rounded-2xl p-10 text-center animate-in" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <svg className="animate-spin mx-auto mb-4" style={{ color: "var(--color-primary)", width: 40, height: 40 }} fill="none" viewBox="0 0 24 24">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-base font-semibold mb-2">Analyse en cours…</p>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Nous comparons vos besoins avec les profils et les avis de nos moniteurs.
            </p>
          </div>
        )}

        {/* Résultats */}
        {done && (
          <div className="animate-in">
            {matches.length === 0 ? (
              <div className="rounded-2xl p-10 text-center" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                <p className="text-3xl mb-4">🤔</p>
                <p className="text-base font-semibold mb-2">Aucune correspondance trouvée</p>
                <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
                  Essayez de compléter votre profil ou d'élargir vos critères pour obtenir de meilleures recommandations.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/profil" className="btn-primary" style={{ textDecoration: "none" }}>Compléter mon profil</Link>
                  <Link href="/resultats" className="text-sm font-semibold px-6 py-3 rounded-xl"
                    style={{ background: "var(--color-surface-hover)", color: "var(--color-text-secondary)", textDecoration: "none" }}>
                    Voir tous les moniteurs
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {matches.map((match, index) => {
                  const m = match.moniteur
                  const initiales = ((m.profiles?.prenom || "?")[0] + (m.profiles?.nom || "?")[0]).toUpperCase()
                  const medailles = ["🥇", "🥈", "🥉"]

                  return (
                    <div key={m.id} className="rounded-2xl overflow-hidden" style={{ background: "var(--color-surface)", border: index === 0 ? "2px solid var(--color-primary)" : "1px solid var(--color-border)" }}>
                      {/* Badge rang */}
                      {index === 0 && (
                        <div className="px-5 py-2 text-xs font-bold" style={{ background: "var(--color-primary)", color: "white" }}>
                          ✨ Meilleure correspondance pour vous
                        </div>
                      )}

                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Médaille + Avatar */}
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-2xl">{medailles[index]}</span>
                            <div className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold"
                              style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>
                              {m.profiles?.avatar_url
                                ? <img src={m.profiles.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover" />
                                : initiales
                              }
                            </div>
                          </div>

                          {/* Infos */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>
                                  {m.profiles?.prenom} {m.profiles?.nom}
                                </h3>
                                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                  {ZONES_LABELS[m.zone] || m.zone}
                                  {m.ville_principale && ` · ${m.ville_principale}`}
                                  {m.experience_annees > 0 && ` · ${m.experience_annees} an${m.experience_annees > 1 ? "s" : ""} d'exp.`}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-xl font-bold" style={{ color: "var(--color-primary)" }}>{m.tarif_horaire} €<span className="text-sm font-normal">/h</span></p>
                              </div>
                            </div>

                            {/* Note */}
                            <div className="flex items-center gap-1 mt-2">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} width="14" height="14" fill={i < Math.floor(m.note_moyenne) ? "#F59E0B" : "none"}
                                  viewBox="0 0 24 24" stroke="#F59E0B" strokeWidth="2">
                                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                </svg>
                              ))}
                              <span className="text-xs ml-1" style={{ color: "var(--color-text-muted)" }}>
                                {m.note_moyenne > 0 ? `${m.note_moyenne.toFixed(1)} (${m.nb_avis} avis)` : "Nouveau"}
                              </span>
                            </div>

                            {/* Raisons du match */}
                            {match.raisons.length > 0 && (
                              <div className="mt-4 rounded-xl p-4" style={{ background: "var(--color-primary-light)" }}>
                                <p className="text-xs font-bold mb-2" style={{ color: "var(--color-primary-dark)" }}>
                                  Pourquoi ce moniteur vous correspond :
                                </p>
                                <div className="flex flex-col gap-1.5">
                                  {match.raisons.map((raison, i) => (
                                    <div key={i} className="flex items-start gap-2 text-xs" style={{ color: "var(--color-primary-dark)" }}>
                                      <span className="flex-shrink-0 mt-0.5">✓</span>
                                      <span>{raison}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Spécialités */}
                            {m.specialites && m.specialites.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-4">
                                {m.specialites.map(s => (
                                  <span key={s} className="text-xs px-2.5 py-1 rounded-full"
                                    style={{ background: "var(--color-surface-hover)", color: "var(--color-text-secondary)", fontWeight: 500 }}>
                                    {SPECIALITES_LABELS[s] || s}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* CTA */}
                            <div className="flex flex-col sm:flex-row gap-2 mt-5">
                              <Link href={`/moniteur/${m.id}`} className="text-sm font-semibold px-5 py-2.5 rounded-xl text-center transition-all"
                                style={{ background: "var(--color-primary)", color: "white", textDecoration: "none" }}>
                                Voir le profil complet
                              </Link>
                              <Link href={`/reserver/${m.id}`} className="text-sm font-semibold px-5 py-2.5 rounded-xl text-center transition-all"
                                style={{ background: "var(--color-surface-hover)", color: "var(--color-text)", textDecoration: "none", border: "1px solid var(--color-border)" }}>
                                Réserver une leçon
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Lien vers tous les moniteurs */}
                <div className="text-center pt-4">
                  <p className="text-sm mb-3" style={{ color: "var(--color-text-muted)" }}>
                    Vous ne trouvez pas votre bonheur ?
                  </p>
                  <Link href="/resultats" className="text-sm font-semibold" style={{ color: "var(--color-primary)", textDecoration: "none" }}>
                    Voir tous les moniteurs disponibles →
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
