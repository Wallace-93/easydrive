"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { createClient } from "@/lib/supabase-client"
import Link from "next/link"

const ETAPES = [
  { num: 1, label: "Vos informations" },
  { num: 2, label: "Votre projet" },
  { num: 3, label: "Vos préférences" },
]

const TYPES_PERMIS = [
  { value: "B", label: "Permis B", desc: "Voiture" },
  { value: "A", label: "Permis A", desc: "Moto" },
  { value: "BE", label: "Permis BE", desc: "Remorque" },
]

const TYPES_BOITE = [
  { value: "manuelle", label: "Boîte manuelle" },
  { value: "automatique", label: "Boîte automatique" },
  { value: "indifferent", label: "Indifférent" },
]

const NIVEAUX = [
  { value: "debutant", label: "Débutant", desc: "Je n'ai jamais conduit" },
  { value: "quelques_lecons", label: "Quelques leçons", desc: "J'ai déjà pris des cours" },
  { value: "reprise", label: "Reprise", desc: "J'ai arrêté et je reprends" },
  { value: "echec_examen", label: "Après un échec", desc: "Je repasse l'examen" },
]

const SITUATIONS = [
  { value: "etudiant", label: "Étudiant(e)" },
  { value: "salarie", label: "Salarié(e)" },
  { value: "demandeur_emploi", label: "Demandeur d'emploi" },
  { value: "autre", label: "Autre" },
]

const CRENEAUX = [
  { value: "matin", label: "Matin", desc: "8h — 12h" },
  { value: "midi", label: "Midi", desc: "12h — 14h" },
  { value: "apres_midi", label: "Après-midi", desc: "14h — 18h" },
  { value: "soir", label: "Soir", desc: "18h — 22h" },
  { value: "week_end", label: "Week-end", desc: "Samedi et dimanche" },
]

const BESOINS = [
  { value: "anxiete", label: "Gestion du stress" },
  { value: "accompagnee", label: "Conduite accompagnée" },
  { value: "autoroute", label: "Conduite sur autoroute" },
  { value: "preparation_examen", label: "Préparation à l'examen" },
  { value: "perfectionnement", label: "Perfectionnement" },
  { value: "handicap", label: "Aménagement handicap" },
]

const BUDGETS = [
  { value: "moins_30", label: "Moins de 30 €/h" },
  { value: "30_40", label: "30 à 40 €/h" },
  { value: "40_50", label: "40 à 50 €/h" },
  { value: "plus_50", label: "Plus de 50 €/h" },
  { value: "indifferent", label: "Peu importe" },
]

export default function Inscription() {
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
    typePermis: "B",
    typeBoite: "",
    niveau: "",
    situation: "",
    villePrincipale: "",
    lieuxSupplementaires: [""],
    rayonKm: "15",
    budget: "",
    creneaux: [] as string[],
    besoins: [] as string[],
    codeParrain: "",
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
      if (!form.email.trim() || !form.email.includes("@")) { setError("Veuillez renseigner un email valide."); return false }
      if (!form.telephone.trim()) { setError("Veuillez renseigner votre numéro de téléphone."); return false }
      if (form.password.length < 6) { setError("Le mot de passe doit contenir au moins 6 caractères."); return false }
    }
    if (etape === 2) {
      if (!form.typeBoite) { setError("Veuillez choisir un type de boîte de vitesses."); return false }
      if (!form.niveau) { setError("Veuillez indiquer votre niveau."); return false }
      if (!form.situation) { setError("Veuillez indiquer votre situation."); return false }
    }
    if (etape === 3) {
      if (!form.villePrincipale.trim()) { setError("Veuillez renseigner votre ville ou code postal."); return false }
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
      role: "eleve",
      telephone: form.telephone.trim(),
    })

    if (profileError) {
      setError("Erreur lors de la création du profil : " + profileError.message)
      setLoading(false)
      return
    }

    const lieuxFiltres = form.lieuxSupplementaires.filter(l => l.trim() !== "")

    const { error: eleveError } = await supabase.from("eleves").insert({
      user_id: userId,
      type_permis: form.typePermis,
      type_boite: form.typeBoite,
      niveau: form.niveau,
      situation: form.situation,
      ville_principale: form.villePrincipale.trim(),
      lieux_supplementaires: lieuxFiltres,
      rayon_km: parseInt(form.rayonKm),
      budget: form.budget,
      creneaux: form.creneaux,
      besoins: form.besoins,
    })

    if (eleveError) {
      setError("Erreur lors de l'enregistrement de vos préférences : " + eleveError.message)
      setLoading(false)
      return
    }

    // Enregistrer le parrainage si un code est fourni
    if (form.codeParrain.trim()) {
      const code = form.codeParrain.trim().toUpperCase()
      // Trouver le parrain par son code (les 8 premiers caractères de son ID)
      const { data: allProfiles } = await supabase.from("profiles").select("id")
      if (allProfiles) {
        const parrain = allProfiles.find(p => p.id.substring(0, 8).toUpperCase() === code)
        if (parrain && parrain.id !== userId) {
          // Créer le parrainage niveau 1
          await supabase.from("parrainages").insert({
            parrain_id: parrain.id,
            filleul_id: userId,
            niveau: 1,
            statut: "inscrit",
            montant: 15,
          })

          // Vérifier si le parrain a lui-même un parrain (niveau 2)
          const { data: parrainDuParrain } = await supabase
            .from("parrainages")
            .select("parrain_id")
            .eq("filleul_id", parrain.id)
            .eq("niveau", 1)
            .single()

          if (parrainDuParrain) {
            await supabase.from("parrainages").insert({
              parrain_id: parrainDuParrain.parrain_id,
              filleul_id: userId,
              niveau: 2,
              statut: "inscrit",
              montant: 5,
            })
          }
        }
      }
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
            Bienvenue sur Just Conduite, {form.prenom} !
          </h1>
          <p className="mb-8" style={{ color: "var(--color-text-secondary)", fontSize: 15 }}>
            Votre compte a été créé avec succès. Découvrez les moniteurs disponibles près de chez vous.
          </p>
          <button
            onClick={() => window.location.replace("/dashboard")}
            className="btn-primary w-full"
          >
            Découvrir les moniteurs →
          </button>
          <Link href="/connexion" className="block mt-4 text-sm" style={{ color: "var(--color-text-muted)" }}>
            Se connecter avec un autre compte
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      {/* En-tête */}
      <header className="border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-1" style={{ fontFamily: "var(--font-display)", textDecoration: "none" }}>
            <span className="text-xl font-extrabold" style={{ color: "var(--color-primary)" }}>Just</span>
            <span className="text-xl font-light" style={{ color: "var(--color-text)" }}>Conduite</span>
          </Link>
          <Link href="/connexion" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>
            Déjà inscrit ?
          </Link>
        </div>
      </header>

      {/* Barre de progression */}
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-2">
        <div className="flex items-center justify-between mb-2">
          {ETAPES.map((e) => (
            <div key={e.num} className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all"
                style={{
                  background: etape >= e.num ? "var(--color-primary)" : "var(--color-border)",
                  color: etape >= e.num ? "white" : "var(--color-text-muted)",
                }}
              >
                {etape > e.num ? (
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : e.num}
              </div>
              <span
                className="text-sm font-medium hidden sm:block"
                style={{ color: etape >= e.num ? "var(--color-text)" : "var(--color-text-muted)" }}
              >
                {e.label}
              </span>
            </div>
          ))}
        </div>
        <div className="h-1 rounded-full" style={{ background: "var(--color-border)" }}>
          <div
            className="h-1 rounded-full transition-all duration-500"
            style={{
              background: "var(--color-primary)",
              width: `${((etape - 1) / (ETAPES.length - 1)) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="rounded-2xl p-6 sm:p-8 animate-in" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>

          {/* ─────── ÉTAPE 1 : Informations personnelles ─────── */}
          {etape === 1 && (
            <div>
              <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>
                Créez votre compte
              </h2>
              <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
                Ces informations nous permettent de personnaliser votre expérience.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--color-text)" }}>Prénom</label>
                  <input
                    type="text" placeholder="Jean" value={form.prenom}
                    onChange={e => updateForm("prenom", e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--color-text)" }}>Nom</label>
                  <input
                    type="text" placeholder="Dupont" value={form.nom}
                    onChange={e => updateForm("nom", e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--color-text)" }}>Adresse e-mail</label>
                <input
                  type="email" placeholder="jean.dupont@email.com" value={form.email}
                  onChange={e => updateForm("email", e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--color-text)" }}>Téléphone</label>
                <input
                  type="tel" placeholder="06 12 34 56 78" value={form.telephone}
                  onChange={e => updateForm("telephone", e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--color-text)" }}>Mot de passe</label>
                <input
                  type="password" placeholder="6 caractères minimum" value={form.password}
                  onChange={e => updateForm("password", e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          )}

          {/* ─────── ÉTAPE 2 : Projet de conduite ─────── */}
          {etape === 2 && (
            <div>
              <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>
                Votre projet de conduite
              </h2>
              <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
                Aidez-nous à trouver le moniteur idéal pour vous.
              </p>

              {/* Type de permis */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3" style={{ color: "var(--color-text)" }}>Type de permis</label>
                <div className="grid grid-cols-3 gap-3">
                  {TYPES_PERMIS.map(tp => (
                    <div
                      key={tp.value}
                      onClick={() => updateForm("typePermis", tp.value)}
                      className={`card-select ${form.typePermis === tp.value ? "card-select-active" : ""}`}
                    >
                      <span className="text-sm font-semibold">{tp.label}</span>
                      <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{tp.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Type de boîte */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3" style={{ color: "var(--color-text)" }}>Boîte de vitesses</label>
                <div className="flex flex-wrap gap-2">
                  {TYPES_BOITE.map(tb => (
                    <div
                      key={tb.value}
                      onClick={() => updateForm("typeBoite", tb.value)}
                      className={`chip ${form.typeBoite === tb.value ? "chip-active" : ""}`}
                    >
                      {tb.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Niveau */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3" style={{ color: "var(--color-text)" }}>Votre niveau</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {NIVEAUX.map(n => (
                    <div
                      key={n.value}
                      onClick={() => updateForm("niveau", n.value)}
                      className={`card-select ${form.niveau === n.value ? "card-select-active" : ""}`}
                      style={{ flexDirection: "column", alignItems: "flex-start" }}
                    >
                      <span className="text-sm font-semibold">{n.label}</span>
                      <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{n.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Situation */}
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: "var(--color-text)" }}>Votre situation</label>
                <div className="flex flex-wrap gap-2">
                  {SITUATIONS.map(s => (
                    <div
                      key={s.value}
                      onClick={() => updateForm("situation", s.value)}
                      className={`chip ${form.situation === s.value ? "chip-active" : ""}`}
                    >
                      {s.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─────── ÉTAPE 3 : Préférences ─────── */}
          {etape === 3 && (
            <div>
              <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>
                Vos préférences
              </h2>
              <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
                Dernière étape ! Précisez vos disponibilités et vos besoins.
              </p>

              {/* Lieu principal */}
              <div className="mb-5">
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--color-text)" }}>
                  Ville ou code postal principal
                </label>
                <input
                  type="text" placeholder="Ex : Créteil ou 94000" value={form.villePrincipale}
                  onChange={e => updateForm("villePrincipale", e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Lieux supplémentaires */}
              <div className="mb-5">
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--color-text)" }}>
                  Autres lieux de prise en charge
                  <span className="font-normal ml-1" style={{ color: "var(--color-text-muted)" }}>(facultatif)</span>
                </label>
                <p className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
                  Ajoutez d'autres adresses si vous souhaitez réserver des cours depuis votre travail, votre école, etc.
                </p>
                {form.lieuxSupplementaires.map((lieu, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <input
                      type="text" placeholder={`Ex : ${i === 0 ? "Paris 12e" : "Gare de Lyon"}`}
                      value={lieu}
                      onChange={e => modifierLieu(i, e.target.value)}
                      className="input-field"
                    />
                    <button
                      type="button"
                      onClick={() => supprimerLieu(i)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ color: "var(--color-text-muted)" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "var(--color-error)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "var(--color-text-muted)")}
                    >
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={ajouterLieu}
                  className="text-sm font-medium mt-1 flex items-center gap-1"
                  style={{ color: "var(--color-primary)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Ajouter un lieu
                </button>
              </div>

              {/* Rayon */}
              <div className="mb-5">
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--color-text)" }}>
                  Rayon de recherche : <span style={{ color: "var(--color-primary)" }}>{form.rayonKm} km</span>
                </label>
                <input
                  type="range" min="5" max="50" step="5" value={form.rayonKm}
                  onChange={e => updateForm("rayonKm", e.target.value)}
                  className="w-full accent-[#00B37D]"
                />
                <div className="flex justify-between text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                  <span>5 km</span><span>50 km</span>
                </div>
              </div>

              {/* Budget */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3" style={{ color: "var(--color-text)" }}>Budget par heure de conduite</label>
                <div className="flex flex-wrap gap-2">
                  {BUDGETS.map(b => (
                    <div
                      key={b.value}
                      onClick={() => updateForm("budget", b.value)}
                      className={`chip ${form.budget === b.value ? "chip-active" : ""}`}
                    >
                      {b.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Créneaux */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3" style={{ color: "var(--color-text)" }}>
                  Créneaux disponibles
                  <span className="font-normal ml-1" style={{ color: "var(--color-text-muted)" }}>(plusieurs choix possibles)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CRENEAUX.map(c => (
                    <div
                      key={c.value}
                      onClick={() => toggleArray("creneaux", c.value)}
                      className={`card-select ${form.creneaux.includes(c.value) ? "card-select-active" : ""}`}
                    >
                      <span className="text-sm font-semibold">{c.label}</span>
                      <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{c.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Besoins spécifiques */}
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: "var(--color-text)" }}>
                  Besoins spécifiques
                  <span className="font-normal ml-1" style={{ color: "var(--color-text-muted)" }}>(facultatif)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {BESOINS.map(b => (
                    <div
                      key={b.value}
                      onClick={() => toggleArray("besoins", b.value)}
                      className={`chip ${form.besoins.includes(b.value) ? "chip-active" : ""}`}
                    >
                      {b.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─────── Erreur ─────── */}
          {error && (
            <div className="mt-5 p-4 rounded-xl text-sm" style={{ background: "var(--color-error-light)", color: "var(--color-error)", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </div>
          )}

          {/* ─────── Boutons ─────── */}
          <div className="mt-8 flex items-center justify-between gap-4">
            {etape > 1 ? (
              <button
                type="button"
                onClick={precedent}
                className="text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
                style={{ background: "var(--color-surface-hover)", color: "var(--color-text-secondary)", border: "none", cursor: "pointer" }}
              >
                ← Retour
              </button>
            ) : <div />}

            {etape < 3 ? (
              <button type="button" onClick={suivant} className="btn-primary">
                Continuer →
              </button>
            ) : (
              <button type="button" onClick={finaliser} className="btn-primary" disabled={loading}>
                {loading ? "Création du compte…" : "Créer mon compte"}
              </button>
            )}
          </div>
        </div>

        {/* Lien connexion */}
        <p className="text-center text-sm mt-6" style={{ color: "var(--color-text-muted)" }}>
          Vous avez déjà un compte ?{" "}
          <Link href="/connexion" className="font-semibold" style={{ color: "var(--color-primary)", textDecoration: "none" }}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
