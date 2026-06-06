"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import Link from "next/link"

const ZONES_LABELS: Record<string, string> = {
  paris: "Paris intra-muros",
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

export default function Profil() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState("")
  const [userId, setUserId] = useState("")

  const [profil, setProfil] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    email: "",
  })

  const [eleveData, setEleveData] = useState({
    ville_principale: "",
    lieux_supplementaires: [] as string[],
    rayon_km: 15,
    budget: "",
    creneaux: [] as string[],
    besoins: [] as string[],
  })

  const [moniteurData, setMoniteurData] = useState({
    tarif_horaire: 45,
    zone: "",
    ville_principale: "",
    lieux_supplementaires: [] as string[],
    rayon_km: 15,
    bio: "",
    specialites: [] as string[],
    creneaux: [] as string[],
    type_boite: "",
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        window.location.replace("/connexion")
        return
      }

      setUserId(session.user.id)
      setProfil(prev => ({ ...prev, email: session.user.email || "" }))

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single()

      if (profile) {
        setRole(profile.role)
        setProfil({
          prenom: profile.prenom || "",
          nom: profile.nom || "",
          telephone: profile.telephone || "",
          email: session.user.email || "",
        })
      }

      if (profile?.role === "eleve") {
        const { data: eleve } = await supabase
          .from("eleves")
          .select("*")
          .eq("user_id", session.user.id)
          .single()

        if (eleve) {
          setEleveData({
            ville_principale: eleve.ville_principale || "",
            lieux_supplementaires: eleve.lieux_supplementaires || [],
            rayon_km: eleve.rayon_km || 15,
            budget: eleve.budget || "",
            creneaux: eleve.creneaux || [],
            besoins: eleve.besoins || [],
          })
        }
      }

      if (profile?.role === "moniteur") {
        const { data: moniteur } = await supabase
          .from("moniteurs")
          .select("*")
          .eq("user_id", session.user.id)
          .single()

        if (moniteur) {
          setMoniteurData({
            tarif_horaire: moniteur.tarif_horaire || 45,
            zone: moniteur.zone || "",
            ville_principale: moniteur.ville_principale || "",
            lieux_supplementaires: moniteur.lieux_supplementaires || [],
            rayon_km: moniteur.rayon_km || 15,
            bio: moniteur.bio || "",
            specialites: moniteur.specialites || [],
            creneaux: moniteur.creneaux || [],
            type_boite: moniteur.type_boite || "",
          })
        }
      }

      setLoading(false)
    }
    load()
  }, [])

  async function sauvegarder() {
    setSaving(true)
    setError(null)
    setSaved(false)

    const supabase = createClient()

    const { error: profErr } = await supabase
      .from("profiles")
      .update({
        prenom: profil.prenom.trim(),
        nom: profil.nom.trim(),
        telephone: profil.telephone.trim(),
      })
      .eq("id", userId)

    if (profErr) {
      setError("Erreur lors de la sauvegarde du profil : " + profErr.message)
      setSaving(false)
      return
    }

    if (role === "eleve") {
      const { error: eleveErr } = await supabase
        .from("eleves")
        .update({
          ville_principale: eleveData.ville_principale.trim(),
          lieux_supplementaires: eleveData.lieux_supplementaires.filter(l => l.trim() !== ""),
          rayon_km: eleveData.rayon_km,
          budget: eleveData.budget,
          creneaux: eleveData.creneaux,
          besoins: eleveData.besoins,
        })
        .eq("user_id", userId)

      if (eleveErr) {
        setError("Erreur lors de la sauvegarde des préférences : " + eleveErr.message)
        setSaving(false)
        return
      }
    }

    if (role === "moniteur") {
      const { error: monErr } = await supabase
        .from("moniteurs")
        .update({
          tarif_horaire: moniteurData.tarif_horaire,
          zone: moniteurData.zone,
          ville_principale: moniteurData.ville_principale.trim(),
          lieux_supplementaires: moniteurData.lieux_supplementaires.filter(l => l.trim() !== ""),
          rayon_km: moniteurData.rayon_km,
          bio: moniteurData.bio.trim(),
          specialites: moniteurData.specialites,
          creneaux: moniteurData.creneaux,
          type_boite: moniteurData.type_boite,
          boite_auto: moniteurData.type_boite === "automatique" || moniteurData.type_boite === "les_deux",
        })
        .eq("user_id", userId)

      if (monErr) {
        setError("Erreur lors de la sauvegarde du profil moniteur : " + monErr.message)
        setSaving(false)
        return
      }
    }

    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  function toggleMoniteurSpec(value: string) {
    setMoniteurData(prev => ({
      ...prev,
      specialites: prev.specialites.includes(value)
        ? prev.specialites.filter(s => s !== value)
        : [...prev.specialites, value],
    }))
  }

  function toggleMoniteurCreneau(value: string) {
    setMoniteurData(prev => ({
      ...prev,
      creneaux: prev.creneaux.includes(value)
        ? prev.creneaux.filter(c => c !== value)
        : [...prev.creneaux, value],
    }))
  }

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

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      <header className="border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-1" style={{ fontFamily: "var(--font-display)", textDecoration: "none" }}>
            <span className="text-xl font-extrabold" style={{ color: "var(--color-primary)" }}>Easy</span>
            <span className="text-xl font-light" style={{ color: "var(--color-text)" }}>Drive</span>
          </Link>
          <Link href="/dashboard" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>
            ← Tableau de bord
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>Mon profil</h1>
        <p className="text-sm mb-8" style={{ color: "var(--color-text-secondary)" }}>
          Modifiez vos informations personnelles{role === "moniteur" ? " et votre profil moniteur" : ""}.
        </p>

        {/* Informations personnelles */}
        <div className="rounded-2xl p-6 sm:p-8 mb-6" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <h2 className="text-base font-bold mb-5">Informations personnelles</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Prénom</label>
              <input type="text" value={profil.prenom} onChange={e => setProfil(prev => ({ ...prev, prenom: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Nom</label>
              <input type="text" value={profil.nom} onChange={e => setProfil(prev => ({ ...prev, nom: e.target.value }))} className="input-field" />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-semibold mb-1.5">Téléphone</label>
            <input type="tel" value={profil.telephone} onChange={e => setProfil(prev => ({ ...prev, telephone: e.target.value }))} className="input-field" />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-semibold mb-1.5">Adresse e-mail</label>
            <input type="email" value={profil.email} disabled className="input-field" style={{ opacity: 0.6 }} />
            <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>L'adresse e-mail ne peut pas être modifiée.</p>
          </div>
        </div>

        {/* Section moniteur */}
        {role === "moniteur" && (
          <>
            {/* Tarif et boîte */}
            <div className="rounded-2xl p-6 sm:p-8 mb-6" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
              <h2 className="text-base font-bold mb-5">Tarif et véhicule</h2>

              <div className="mb-5">
                <label className="block text-sm font-semibold mb-1.5">
                  Tarif horaire : <span style={{ color: "var(--color-primary)" }}>{moniteurData.tarif_horaire} €/h</span>
                </label>
                <input type="range" min="25" max="80" step="5" value={moniteurData.tarif_horaire}
                  onChange={e => setMoniteurData(prev => ({ ...prev, tarif_horaire: parseInt(e.target.value) }))}
                  className="w-full accent-[#00B37D]" />
                <div className="flex justify-between text-xs mt-1" style={{ color: "var(--color-text-muted)" }}><span>25 €</span><span>80 €</span></div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3">Boîte de vitesses</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "manuelle", label: "Manuelle uniquement" },
                    { value: "automatique", label: "Automatique uniquement" },
                    { value: "les_deux", label: "Les deux" },
                  ].map(tb => (
                    <div key={tb.value} onClick={() => setMoniteurData(prev => ({ ...prev, type_boite: tb.value }))}
                      className={`chip ${moniteurData.type_boite === tb.value ? "chip-active" : ""}`}>
                      {tb.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Zone et lieux */}
            <div className="rounded-2xl p-6 sm:p-8 mb-6" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
              <h2 className="text-base font-bold mb-5">Zone et lieux</h2>

              <div className="mb-5">
                <label className="block text-sm font-semibold mb-3">Zone d'intervention</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(ZONES_LABELS).map(([val, label]) => (
                    <div key={val} onClick={() => setMoniteurData(prev => ({ ...prev, zone: val }))}
                      className={`chip ${moniteurData.zone === val ? "chip-active" : ""}`}>
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold mb-1.5">Lieu principal</label>
                <input type="text" value={moniteurData.ville_principale}
                  onChange={e => setMoniteurData(prev => ({ ...prev, ville_principale: e.target.value }))} className="input-field" />
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold mb-1.5">Autres lieux de prise en charge</label>
                {moniteurData.lieux_supplementaires.map((lieu, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <input type="text" value={lieu}
                      onChange={e => {
                        const lieux = [...moniteurData.lieux_supplementaires]
                        lieux[i] = e.target.value
                        setMoniteurData(prev => ({ ...prev, lieux_supplementaires: lieux }))
                      }} className="input-field" />
                    <button type="button" onClick={() => setMoniteurData(prev => ({ ...prev, lieux_supplementaires: prev.lieux_supplementaires.filter((_, j) => j !== i) }))}
                      style={{ color: "var(--color-text-muted)", background: "none", border: "none", cursor: "pointer" }}>✕</button>
                  </div>
                ))}
                <button type="button" onClick={() => setMoniteurData(prev => ({ ...prev, lieux_supplementaires: [...prev.lieux_supplementaires, ""] }))}
                  className="text-sm font-medium flex items-center gap-1" style={{ color: "var(--color-primary)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  + Ajouter un lieu
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">
                  Rayon de déplacement : <span style={{ color: "var(--color-primary)" }}>{moniteurData.rayon_km} km</span>
                </label>
                <input type="range" min="5" max="50" step="5" value={moniteurData.rayon_km}
                  onChange={e => setMoniteurData(prev => ({ ...prev, rayon_km: parseInt(e.target.value) }))}
                  className="w-full accent-[#00B37D]" />
              </div>
            </div>

            {/* Spécialités et créneaux */}
            <div className="rounded-2xl p-6 sm:p-8 mb-6" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
              <h2 className="text-base font-bold mb-5">Spécialités et disponibilités</h2>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3">Spécialités</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(SPECIALITES_LABELS).map(([val, label]) => (
                    <div key={val} onClick={() => toggleMoniteurSpec(val)}
                      className={`chip ${moniteurData.specialites.includes(val) ? "chip-active" : ""}`}>
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3">Créneaux disponibles</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "matin", label: "Matin" },
                    { value: "midi", label: "Midi" },
                    { value: "apres_midi", label: "Après-midi" },
                    { value: "soir", label: "Soir" },
                    { value: "week_end", label: "Week-end" },
                  ].map(c => (
                    <div key={c.value} onClick={() => toggleMoniteurCreneau(c.value)}
                      className={`chip ${moniteurData.creneaux.includes(c.value) ? "chip-active" : ""}`}>
                      {c.label}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">Présentation</label>
                <textarea value={moniteurData.bio} onChange={e => setMoniteurData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4} className="input-field" style={{ resize: "vertical" }}
                  placeholder="Décrivez votre approche pédagogique…" />
              </div>
            </div>
          </>
        )}

        {/* Erreur / Succès */}
        {error && (
          <div className="mb-5 p-4 rounded-xl text-sm" style={{ background: "var(--color-error-light)", color: "var(--color-error)", border: "1px solid rgba(239,68,68,0.2)" }}>
            {error}
          </div>
        )}

        {saved && (
          <div className="mb-5 p-4 rounded-xl text-sm" style={{ background: "var(--color-success-light)", color: "var(--color-success)", border: "1px solid rgba(0,179,125,0.2)" }}>
            Profil mis à jour avec succès !
          </div>
        )}

        {/* Bouton sauvegarder */}
        <button type="button" onClick={sauvegarder} className="btn-primary w-full" disabled={saving}>
          {saving ? "Sauvegarde en cours…" : "Enregistrer les modifications"}
        </button>

        <p className="text-center text-sm mt-6">
          <button onClick={() => { createClient().auth.signOut().then(() => window.location.replace("/connexion")) }}
            className="font-medium" style={{ color: "var(--color-error)", background: "none", border: "none", cursor: "pointer" }}>
            Se déconnecter
          </button>
        </p>
      </div>
    </div>
  )
}
