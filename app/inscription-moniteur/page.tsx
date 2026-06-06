"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { createClient } from "@/lib/supabase-client"
import Link from "next/link"

const ETAPES = [
  { num: 1, label: "Vos informations" },
  { num: 2, label: "Votre profil pro" },
  { num: 3, label: "Zone et disponibilités" },
]

const DIPLOMES = [
  { value: "BEPECASER", label: "BEPECASER" },
  { value: "TP_ECSR", label: "Titre Pro ECSR" },
  { value: "autre", label: "Autre diplôme" },
]

const SPECIALITES = [
  { value: "conduite_accompagnee", label: "Conduite accompagnée (AAC)" },
  { value: "conduite_supervisee", label: "Conduite supervisée" },
  { value: "perfectionnement", label: "Perfectionnement" },
  { value: "remise_a_niveau", label: "Remise à niveau" },
  { value: "anxiete", label: "Gestion du stress au volant" },
  { value: "autoroute", label: "Conduite sur autoroute" },
  { value: "handicap", label: "Adaptation handicap" },
  { value: "preparation_examen", label: "Préparation à l'examen" },
]

const TYPES_BOITE = [
  { value: "manuelle", label: "Boîte manuelle uniquement" },
  { value: "automatique", label: "Boîte automatique uniquement" },
  { value: "les_deux", label: "Les deux" },
]

const CRENEAUX = [
  { value: "matin", label: "Matin", desc: "8h — 12h" },
  { value: "midi", label: "Midi", desc: "12h — 14h" },
  { value: "apres_midi", label: "Après-midi", desc: "14h — 18h" },
  { value: "soir", label: "Soir", desc: "18h — 21h" },
  { value: "week_end", label: "Week-end", desc: "Samedi et dimanche" },
]

const ZONES_IDF = [
  { value: "paris", label: "Paris intra-muros" },
  { value: "hauts_de_seine", label: "Hauts-de-Seine (92)" },
  { value: "seine_saint_denis", label: "Seine-Saint-Denis (93)" },
  { value: "val_de_marne", label: "Val-de-Marne (94)" },
  { value: "yvelines", label: "Yvelines (78)" },
  { value: "essonne", label: "Essonne (91)" },
  { value: "val_d_oise", label: "Val-d'Oise (95)" },
  { value: "seine_et_marne", label: "Seine-et-Marne (77)" },
]

export default function InscriptionMoniteur() {
  const [etape, setEtape] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    password: "",
    diplome: "",
    experienceAnnees: "",
    specialites: [] as string[],
    typeBoite: "",
    tarifHoraire: "45",
    zone: "",
    villePrincipale: "",
    lieuxSupplementaires: [""],
    rayonKm: "15",
    bio: "",
    creneaux: [] as string[],
  })

  function updateForm(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  function toggleArray(field: string, value: string) {
    setForm(prev => {
      const arr = (prev as any)[field] as string[]
      return {
        ...prev,
        [field]: arr.includes(value)
          ? arr.filter(v => v !== value)
          : [...arr, value],
      }
    })
  }

  function ajouterLieu() {
    setForm(prev => ({
      ...prev,
      lieuxSupplementaires: [...prev.lieuxSupplementaires, ""],
    }))
  }

  function modifierLieu(index: number, value: string) {
    setForm(prev => {
      const lieux = [...prev.lieuxSupplementaires]
      lieux[index] = value
      return { ...prev, lieuxSupplementaires: lieux }
    })
  }

  function supprimerLieu(index: number) {
    setForm(prev => ({
      ...prev,
      lieuxSupplementaires: prev.lieuxSupplementaires.filter((_, i) => i !== index),
    }))
  }

  function validerEtape(): boolean {
    if (etape === 1) {
      if (!form.prenom.trim()) { setError("Veuillez renseigner votre prénom."); return false }
      if (!form.nom.trim()) { setError("Veuillez renseigner votre nom."); return false }
      if (!form.email.trim() || !form.email.includes("@")) { setError("Veuillez renseigner un e-mail valide."); return false }
      if (!form.telephone.trim()) { setError("Veuillez renseigner votre numéro de téléphone."); return false }
      if (form.password.length < 6) { setError("Le mot de passe doit contenir au moins 6 caractères."); return false }
    }
    if (etape === 2) {
      if (!form.diplome) { setError("Veuillez sélectionner votre diplôme."); return false }
      if (!form.experienceAnnees.trim()) { setError("Veuillez indiquer vos années d'expérience."); return false }
      if (!form.typeBoite) { setError("Veuillez indiquer le type de boîte de vitesses."); return false }
    }
    if (etape === 3) {
      if (!form.zone) { setError("Veuillez sélectionner votre zone d'intervention."); return false }
      if (!form.villePrincipale.trim()) { setError("Veuillez renseigner votre ville ou point de départ."); return false }
      if (form.creneaux.length === 0) { setError("Veuillez sélectionner au moins un créneau."); return false }
    }
    return true
  }

  function suivant() {
    if (!validerEtape()) return
    setEtape(prev => prev + 1)
  }

  function precedent() {
    setError(null)
    setEtape(prev => prev - 1)
  }

  async function finaliser() {
    if (!validerEtape()) return
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (authError) {
      setError("Erreur lors de la création du compte : " + authError.message)
      setLoading(false)
      return
    }

    const userId = authData.user?.id
    if (!userId) {
      setError("Erreur inattendue. Veuillez réessayer.")
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      prenom: form.prenom.trim(),
      nom: form.nom.trim(),
      role: "moniteur",
      telephone: form.telephone.trim(),
    })

    if (profileError) {
      setError("Erreur lors de la création du profil : " + profileError.message)
      setLoading(false)
      return
    }

    const boiteAuto = form.typeBoite === "automatique" || form.typeBoite === "les_deux"
    const lieuxFiltres = form.lieuxSupplementaires.filter(l => l.trim() !== "")

    const { error: moniteurError } = await supabase.from("moniteurs").insert({
      user_id: userId,
      diplome: form.diplome,
      experience_annees: parseInt(form.experienceAnnees) || 0,
      specialites: form.specialites,
      boite_auto: boiteAuto,
      type_boite: form.typeBoite,
      tarif_horaire: parseInt(form.tarifHoraire) || 45,
      zone: form.zone,
      ville_principale: form.villePrincipale.trim(),
      lieux_supplementaires: lieuxFiltres,
      rayon_km: parseInt(form.rayonKm),
      bio: form.bio.trim(),
      creneaux: form.creneaux,
      verifie: false,
      note_moyenne: 0,
      nb_avis: 0,
    })

    if (moniteurError) {
      setError("Erreur lors de l'enregistrement de votre profil moniteur : " + moniteurError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--color-background)" }}>
        <div className="w-full max-w-md text-center animate-in">
          <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: "var(--color-primary-light)" }}>
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="var(--color-primary)" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Bienvenue sur Easy Drive, {form.prenom} !
          </h1>
          <p className="mb-3" style={{ color: "var(--color-text-secondary)", fontSize: 15 }}>
            Votre profil moniteur a été créé avec succès.
          </p>
          <p className="mb-8 text-sm" style={{ color: "var(--color-text-muted)" }}>
            Notre équipe va vérifier vos informations. Vous recevrez une confirmation sous 24 à 48 heures.
          </p>
          <button onClick={() => window.location.replace("/dashboard")} className="btn-primary w-full">
            Accéder à mon espace →
          </button>
        </div>
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
          <Link href="/connexion" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>
            Déjà inscrit ?
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-8 pb-2">
        <div className="flex items-center justify-between mb-2">
          {ETAPES.map((e) => (
            <div key={e.num} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all"
                style={{ background: etape >= e.num ? "var(--color-primary)" : "var(--color-border)", color: etape >= e.num ? "white" : "var(--color-text-muted)" }}>
                {etape > e.num ? (
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : e.num}
              </div>
              <span className="text-sm font-medium hidden sm:block"
                style={{ color: etape >= e.num ? "var(--color-text)" : "var(--color-text-muted)" }}>
                {e.label}
              </span>
            </div>
          ))}
        </div>
        <div className="h-1 rounded-full" style={{ background: "var(--color-border)" }}>
          <div className="h-1 rounded-full transition-all duration-500"
            style={{ background: "var(--color-primary)", width: `${((etape - 1) / (ETAPES.length - 1)) * 100}%` }} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="rounded-2xl p-6 sm:p-8 animate-in" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>

          {/* ─────── ÉTAPE 1 ─────── */}
          {etape === 1 && (
            <div>
              <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>Devenez moniteur Easy Drive</h2>
              <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
                Rejoignez la plateforme avec la commission la plus basse du marché : seulement 15 %.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Prénom</label>
                  <input type="text" placeholder="Jean" value={form.prenom} onChange={e => updateForm("prenom", e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Nom</label>
                  <input type="text" placeholder="Dupont" value={form.nom} onChange={e => updateForm("nom", e.target.value)} className="input-field" />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-semibold mb-1.5">Adresse e-mail</label>
                <input type="email" placeholder="jean.dupont@email.com" value={form.email} onChange={e => updateForm("email", e.target.value)} className="input-field" />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-semibold mb-1.5">Téléphone</label>
                <input type="tel" placeholder="06 12 34 56 78" value={form.telephone} onChange={e => updateForm("telephone", e.target.value)} className="input-field" />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-semibold mb-1.5">Mot de passe</label>
                <input type="password" placeholder="6 caractères minimum" value={form.password} onChange={e => updateForm("password", e.target.value)} className="input-field" />
              </div>
            </div>
          )}

          {/* ─────── ÉTAPE 2 ─────── */}
          {etape === 2 && (
            <div>
              <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>Votre profil professionnel</h2>
              <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>Ces informations seront visibles par les élèves sur votre profil.</p>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3">Diplôme d'enseignement</label>
                <div className="flex flex-wrap gap-2">
                  {DIPLOMES.map(d => (
                    <div key={d.value} onClick={() => updateForm("diplome", d.value)} className={`chip ${form.diplome === d.value ? "chip-active" : ""}`}>{d.label}</div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-1.5">Années d'expérience</label>
                <input type="number" placeholder="Ex : 5" min="0" max="50" value={form.experienceAnnees}
                  onChange={e => updateForm("experienceAnnees", e.target.value)} className="input-field" style={{ maxWidth: 160 }} />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3">Type de boîte de vitesses</label>
                <div className="flex flex-wrap gap-2">
                  {TYPES_BOITE.map(tb => (
                    <div key={tb.value} onClick={() => updateForm("typeBoite", tb.value)} className={`chip ${form.typeBoite === tb.value ? "chip-active" : ""}`}>{tb.label}</div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-1.5">
                  Tarif horaire : <span style={{ color: "var(--color-primary)" }}>{form.tarifHoraire} €/h</span>
                </label>
                <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>Vous conservez 85 % de ce montant. Easy Drive prélève 15 % de commission.</p>
                <input type="range" min="25" max="80" step="5" value={form.tarifHoraire}
                  onChange={e => updateForm("tarifHoraire", e.target.value)} className="w-full accent-[#00B37D]" />
                <div className="flex justify-between text-xs mt-1" style={{ color: "var(--color-text-muted)" }}><span>25 €</span><span>80 €</span></div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3">
                  Spécialités <span className="font-normal ml-1" style={{ color: "var(--color-text-muted)" }}>(facultatif)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALITES.map(s => (
                    <div key={s.value} onClick={() => toggleArray("specialites", s.value)} className={`chip ${form.specialites.includes(s.value) ? "chip-active" : ""}`}>{s.label}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─────── ÉTAPE 3 ─────── */}
          {etape === 3 && (
            <div>
              <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>Zone et disponibilités</h2>
              <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>Dernière étape ! Indiquez où et quand vous êtes disponible.</p>

              <div className="mb-5">
                <label className="block text-sm font-semibold mb-3">Zone d'intervention principale</label>
                <div className="flex flex-wrap gap-2">
                  {ZONES_IDF.map(z => (
                    <div key={z.value} onClick={() => updateForm("zone", z.value)} className={`chip ${form.zone === z.value ? "chip-active" : ""}`}>{z.label}</div>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold mb-1.5">Lieu de prise en charge principal</label>
                <input type="text" placeholder="Ex : Créteil, Gare RER" value={form.villePrincipale}
                  onChange={e => updateForm("villePrincipale", e.target.value)} className="input-field" />
              </div>

              {/* Lieux supplémentaires */}
              <div className="mb-5">
                <label className="block text-sm font-semibold mb-1.5">
                  Autres lieux de prise en charge
                  <span className="font-normal ml-1" style={{ color: "var(--color-text-muted)" }}>(facultatif)</span>
                </label>
                <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
                  Ajoutez d'autres points de rendez-vous où vous pouvez accueillir des élèves.
                </p>
                {form.lieuxSupplementaires.map((lieu, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <input type="text" placeholder={`Ex : ${i === 0 ? "Mairie de Montreuil" : "Gare de Lyon"}`}
                      value={lieu} onChange={e => modifierLieu(i, e.target.value)} className="input-field" />
                    <button type="button" onClick={() => supprimerLieu(i)} className="p-2 rounded-lg transition-colors"
                      style={{ color: "var(--color-text-muted)", background: "none", border: "none", cursor: "pointer" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "var(--color-error)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-muted)")}>
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button type="button" onClick={ajouterLieu} className="text-sm font-medium mt-1 flex items-center gap-1"
                  style={{ color: "var(--color-primary)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter un lieu
                </button>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold mb-1.5">
                  Rayon de déplacement : <span style={{ color: "var(--color-primary)" }}>{form.rayonKm} km</span>
                </label>
                <input type="range" min="5" max="50" step="5" value={form.rayonKm}
                  onChange={e => updateForm("rayonKm", e.target.value)} className="w-full accent-[#00B37D]" />
                <div className="flex justify-between text-xs mt-1" style={{ color: "var(--color-text-muted)" }}><span>5 km</span><span>50 km</span></div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3">
                  Créneaux disponibles <span className="font-normal ml-1" style={{ color: "var(--color-text-muted)" }}>(plusieurs choix possibles)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CRENEAUX.map(c => (
                    <div key={c.value} onClick={() => toggleArray("creneaux", c.value)}
                      className={`card-select ${form.creneaux.includes(c.value) ? "card-select-active" : ""}`}>
                      <span className="text-sm font-semibold">{c.label}</span>
                      <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{c.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">
                  Présentez-vous en quelques lignes <span className="font-normal ml-1" style={{ color: "var(--color-text-muted)" }}>(facultatif)</span>
                </label>
                <textarea placeholder="Parlez de votre approche pédagogique, de ce qui vous différencie…"
                  value={form.bio} onChange={e => updateForm("bio", e.target.value)} rows={4}
                  className="input-field" style={{ resize: "vertical" }} />
              </div>
            </div>
          )}

          {error && (
            <div className="mt-5 p-4 rounded-xl text-sm" style={{ background: "var(--color-error-light)", color: "var(--color-error)", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-4">
            {etape > 1 ? (
              <button type="button" onClick={precedent} className="text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
                style={{ background: "var(--color-surface-hover)", color: "var(--color-text-secondary)", border: "none", cursor: "pointer" }}>
                ← Retour
              </button>
            ) : <div />}
            {etape < 3 ? (
              <button type="button" onClick={suivant} className="btn-primary">Continuer →</button>
            ) : (
              <button type="button" onClick={finaliser} className="btn-primary" disabled={loading}>
                {loading ? "Création du compte…" : "Créer mon profil moniteur"}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: "var(--color-text-muted)" }}>
          Vous avez déjà un compte ?{" "}
          <Link href="/connexion" className="font-semibold" style={{ color: "var(--color-primary)", textDecoration: "none" }}>Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
