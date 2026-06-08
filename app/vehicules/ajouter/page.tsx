"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import Link from "next/link"

const CARBURANTS = [
  { value: "essence", label: "Essence" },
  { value: "diesel", label: "Diesel" },
  { value: "hybride", label: "Hybride" },
  { value: "electrique", label: "Électrique" },
]

export default function AjouterVehicule() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const [form, setForm] = useState({
    marque: "",
    modele: "",
    annee: new Date().getFullYear().toString(),
    type_boite: "",
    carburant: "",
    tarif_journalier: "80",
    tarif_horaire: "",
    ville: "",
    description: "",
  })

  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.replace("/connexion"); return }

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()
      if (profile?.role !== "moniteur") {
        setError("Seuls les moniteurs et responsables d'auto-école peuvent proposer un véhicule.")
        setLoading(false)
        return
      }
      setUserId(session.user.id)
      setLoading(false)
    }
    check()
  }, [])

  function updateForm(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  async function soumettre() {
    if (!form.marque.trim()) { setError("Veuillez renseigner la marque."); return }
    if (!form.modele.trim()) { setError("Veuillez renseigner le modèle."); return }
    if (!form.type_boite) { setError("Veuillez choisir le type de boîte."); return }
    if (!form.carburant) { setError("Veuillez choisir le carburant."); return }
    if (!form.ville.trim()) { setError("Veuillez renseigner la ville de stationnement."); return }
    if (!userId) return

    setSubmitting(true)
    setError(null)

    const supabase = createClient()
    const { error: insertError } = await supabase.from("vehicules").insert({
      user_id: userId,
      marque: form.marque.trim(),
      modele: form.modele.trim(),
      annee: parseInt(form.annee),
      type_boite: form.type_boite,
      carburant: form.carburant,
      tarif_journalier: parseInt(form.tarif_journalier) || 80,
      tarif_horaire: form.tarif_horaire ? parseInt(form.tarif_horaire) : null,
      ville: form.ville.trim(),
      description: form.description.trim(),
      disponible: true,
    })

    if (insertError) {
      setError("Erreur lors de l'ajout du véhicule : " + insertError.message)
      setSubmitting(false)
      return
    }

    setSuccess(true)
    setSubmitting(false)
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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--color-background)" }}>
        <div className="w-full max-w-md text-center animate-in">
          <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: "var(--color-primary-light)" }}>
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="var(--color-primary)" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>Véhicule ajouté !</h1>
          <p className="text-sm mb-8" style={{ color: "var(--color-text-secondary)" }}>
            Votre {form.marque} {form.modele} est maintenant visible par les autres moniteurs.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/vehicules" className="btn-primary text-center block" style={{ textDecoration: "none" }}>Voir les véhicules</Link>
            <Link href="/dashboard" className="text-sm font-medium text-center" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>Retour au tableau de bord</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      <header className="border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-1" style={{ fontFamily: "var(--font-display)", textDecoration: "none" }}>
            <span className="text-xl font-extrabold" style={{ color: "var(--color-primary)" }}>Just</span>
            <span className="text-xl font-light" style={{ color: "var(--color-text)" }}>Conduite</span>
          </Link>
          <Link href="/vehicules" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>← Véhicules</Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>Proposer un véhicule</h1>
        <p className="text-sm mb-8" style={{ color: "var(--color-text-secondary)" }}>
          Mettez votre véhicule à double commande à disposition des autres moniteurs.
        </p>

        <div className="rounded-2xl p-6 sm:p-8" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          {/* Marque / Modèle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Marque</label>
              <input type="text" placeholder="Ex : Renault" value={form.marque} onChange={e => updateForm("marque", e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Modèle</label>
              <input type="text" placeholder="Ex : Clio V" value={form.modele} onChange={e => updateForm("modele", e.target.value)} className="input-field" />
            </div>
          </div>

          {/* Année */}
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-1.5">Année</label>
            <input type="number" min="2000" max="2027" value={form.annee} onChange={e => updateForm("annee", e.target.value)} className="input-field" style={{ maxWidth: 140 }} />
          </div>

          {/* Type de boîte */}
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-3">Boîte de vitesses</label>
            <div className="flex gap-2">
              {[{ value: "manuelle", label: "Manuelle" }, { value: "automatique", label: "Automatique" }].map(b => (
                <div key={b.value} onClick={() => updateForm("type_boite", b.value)}
                  className={`chip ${form.type_boite === b.value ? "chip-active" : ""}`}>
                  {b.label}
                </div>
              ))}
            </div>
          </div>

          {/* Carburant */}
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-3">Carburant</label>
            <div className="flex flex-wrap gap-2">
              {CARBURANTS.map(c => (
                <div key={c.value} onClick={() => updateForm("carburant", c.value)}
                  className={`chip ${form.carburant === c.value ? "chip-active" : ""}`}>
                  {c.label}
                </div>
              ))}
            </div>
          </div>

          {/* Tarifs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Tarif journalier (€)</label>
              <input type="number" min="20" max="500" value={form.tarif_journalier} onChange={e => updateForm("tarif_journalier", e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">
                Tarif horaire (€) <span className="font-normal" style={{ color: "var(--color-text-muted)" }}>(facultatif)</span>
              </label>
              <input type="number" min="5" max="100" placeholder="Ex : 15" value={form.tarif_horaire} onChange={e => updateForm("tarif_horaire", e.target.value)} className="input-field" />
            </div>
          </div>

          {/* Ville */}
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-1.5">Ville de stationnement</label>
            <input type="text" placeholder="Ex : Créteil" value={form.ville} onChange={e => updateForm("ville", e.target.value)} className="input-field" />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-1.5">
              Description <span className="font-normal" style={{ color: "var(--color-text-muted)" }}>(facultatif)</span>
            </label>
            <textarea placeholder="État du véhicule, équipements, conditions de location…" value={form.description}
              onChange={e => updateForm("description", e.target.value)} rows={4} className="input-field" style={{ resize: "vertical" }} />
          </div>

          {error && (
            <div className="mb-5 p-4 rounded-xl text-sm" style={{ background: "var(--color-error-light)", color: "var(--color-error)", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </div>
          )}

          <button type="button" onClick={soumettre} className="btn-primary w-full" disabled={submitting}>
            {submitting ? "Ajout en cours…" : "Publier l'annonce"}
          </button>
        </div>
      </div>
    </div>
  )
}
