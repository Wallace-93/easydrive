"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect, use } from "react"
import { createClient } from "@/lib/supabase-client"
import Link from "next/link"
import { envoyerNotification } from "@/lib/notifications"

type Moniteur = {
  id: string
  user_id: string
  tarif_horaire: number
  zone: string
  ville_principale: string
  lieux_supplementaires: string[]
  creneaux: string[]
  profiles: {
    prenom: string
    nom: string
    avatar_url: string | null
  }
}

const HEURES = [
  "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00",
]

export default function Reserver({ params }: { params: Promise<{ moniteurId: string }> }) {
  const { moniteurId } = use(params)
  const [moniteur, setMoniteur] = useState<Moniteur | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [eleveId, setEleveId] = useState<string | null>(null)

  const [date, setDate] = useState("")
  const [heure, setHeure] = useState("")
  const [lieu, setLieu] = useState("")
  const [duree, setDuree] = useState<1 | 2>(1)

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      // Vérifier la session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        window.location.replace("/connexion")
        return
      }

      // Récupérer l'élève
      const { data: eleve } = await supabase
        .from("eleves")
        .select("id")
        .eq("user_id", session.user.id)
        .single()

      if (!eleve) {
        setError("Seuls les élèves peuvent réserver une leçon.")
        setLoading(false)
        return
      }

      setEleveId(eleve.id)

      // Récupérer le moniteur
      const { data: m, error: mErr } = await supabase
        .from("moniteurs")
        .select("*, profiles (prenom, nom, avatar_url)")
        .eq("id", moniteurId)
        .single()

      if (mErr || !m) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setMoniteur(m)
      if (m.ville_principale) setLieu(m.ville_principale)
      setLoading(false)
    }
    load()
  }, [moniteurId])

  async function confirmer() {
    if (!date) { setError("Veuillez choisir une date."); return }
    if (!heure) { setError("Veuillez choisir un horaire."); return }
    if (!lieu.trim()) { setError("Veuillez choisir un lieu de rendez-vous."); return }
    if (!eleveId || !moniteur) return

    setSubmitting(true)
    setError(null)

    const dateHeure = new Date(`${date}T${heure}:00`)

    if (dateHeure <= new Date()) {
      setError("La date et l'heure doivent être dans le futur.")
      setSubmitting(false)
      return
    }

    const supabase = createClient()

    const { error: resErr } = await supabase.from("reservations").insert({
      eleve_id: eleveId,
      moniteur_id: moniteur.id,
      date_heure: dateHeure.toISOString(),
      adresse_rdv: lieu.trim(),
      montant: moniteur.tarif_horaire * duree,
      statut: "en_attente",
    })

    if (resErr) {
      setError("Erreur lors de la réservation : " + resErr.message)
      setSubmitting(false)
      return
    }

    // Notifier le moniteur
    const { data: moniteurProfile } = await supabase
      .from("profiles")
      .select("prenom")
      .eq("id", moniteur.user_id)
      .single()

    const { data: { user: currentUser } } = await supabase.auth.getUser()

    envoyerNotification("reservation_nouvelle", currentUser?.email || "", {
      moniteurPrenom: moniteur.profiles?.prenom || "",
      elevePrenom: "Élève",
      eleveNom: "",
      date: new Date(`${date}T${heure}:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }),
      heure,
      lieu,
      montant: moniteur.tarif_horaire * duree,
    })

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

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--color-background)" }}>
        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>Moniteur introuvable</h1>
        <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>Ce profil n'existe pas ou a été supprimé.</p>
        <Link href="/resultats" className="btn-primary" style={{ textDecoration: "none" }}>Voir tous les moniteurs</Link>
      </div>
    )
  }

  if (success && moniteur) {
    const dateObj = new Date(`${date}T${heure}:00`)
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--color-background)" }}>
        <div className="w-full max-w-md text-center animate-in">
          <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: "var(--color-primary-light)" }}>
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="var(--color-primary)" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>Réservation envoyée !</h1>
          <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
            Votre demande de leçon avec {moniteur.profiles.prenom} a été envoyée. Vous recevrez une confirmation dès que le moniteur aura accepté.
          </p>

          <div className="rounded-2xl p-5 mb-6 text-left" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <span style={{ color: "var(--color-text-muted)" }}>Moniteur</span>
                <span className="font-semibold">{moniteur.profiles.prenom} {moniteur.profiles.nom}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--color-text-muted)" }}>Date</span>
                <span className="font-semibold">{dateObj.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--color-text-muted)" }}>Heure</span>
                <span className="font-semibold">{heure}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--color-text-muted)" }}>Lieu</span>
                <span className="font-semibold">{lieu}</span>
              </div>
              <div className="flex justify-between pt-3" style={{ borderTop: "1px solid var(--color-border)" }}>
                <span style={{ color: "var(--color-text-muted)" }}>Tarif</span>
                <span className="font-bold" style={{ color: "var(--color-primary)" }}>{moniteur.tarif_horaire * duree} €</span>
              </div>
            </div>
          </div>

          <button onClick={() => window.location.replace("/dashboard")} className="btn-primary w-full">
            Voir mon tableau de bord →
          </button>
        </div>
      </div>
    )
  }

  if (!moniteur) return null

  const tousLieux = [moniteur.ville_principale, ...(moniteur.lieux_supplementaires || [])].filter(Boolean)
  const today = new Date().toISOString().split("T")[0]

  // Calculer la date max (3 mois)
  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 3)
  const maxDateStr = maxDate.toISOString().split("T")[0]

  const initiales = (moniteur.profiles.prenom[0] || "").toUpperCase() + (moniteur.profiles.nom[0] || "").toUpperCase()

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      <header className="border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-1" style={{ fontFamily: "var(--font-display)", textDecoration: "none" }}>
            <span className="text-xl font-extrabold" style={{ color: "var(--color-primary)" }}>Easy</span>
            <span className="text-xl font-light" style={{ color: "var(--color-text)" }}>Drive</span>
          </Link>
          <Link href={`/moniteur/${moniteur.id}`} className="text-sm font-medium" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>
            ← Retour au profil
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>Réserver une leçon</h1>

        {/* Carte moniteur */}
        <div className="rounded-2xl p-5 mb-6 flex items-center gap-4" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 text-lg font-bold"
            style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>
            {moniteur.profiles.avatar_url
              ? <img src={moniteur.profiles.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover" />
              : initiales
            }
          </div>
          <div>
            <p className="text-base font-bold">{moniteur.profiles.prenom} {moniteur.profiles.nom}</p>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{moniteur.ville_principale}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xl font-bold" style={{ color: "var(--color-primary)" }}>{moniteur.tarif_horaire} €</p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>par heure</p>
          </div>
        </div>

        {/* Formulaire */}
        <div className="rounded-2xl p-6 sm:p-8" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>

          {/* Date */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Date de la leçon</label>
            <input type="date" value={date} onChange={e => { setDate(e.target.value); setError(null) }}
              min={today} max={maxDateStr} className="input-field" />
          </div>

          {/* Heure */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3">Horaire</label>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {HEURES.map(h => (
                <div key={h} onClick={() => { setHeure(h); setError(null) }}
                  className={`card-select ${heure === h ? "card-select-active" : ""}`}
                  style={{ padding: "10px 8px" }}>
                  <span className="text-sm font-semibold">{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Durée */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3">Durée de la leçon</label>
            <div className="grid grid-cols-2 gap-3">
              <div onClick={() => { setDuree(1); setError(null) }}
                className={`card-select ${duree === 1 ? "card-select-active" : ""}`}>
                <span className="text-lg font-bold">1h</span>
                <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>{moniteur.tarif_horaire} €</span>
              </div>
              <div onClick={() => { setDuree(2); setError(null) }}
                className={`card-select ${duree === 2 ? "card-select-active" : ""}`}>
                <span className="text-lg font-bold">2h</span>
                <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>{moniteur.tarif_horaire * 2} €</span>
              </div>
            </div>
          </div>

          {/* Lieu */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3">Lieu de rendez-vous</label>
            {tousLieux.length > 0 ? (
              <div className="flex flex-col gap-2">
                {tousLieux.map((l, i) => (
                  <div key={i} onClick={() => { setLieu(l); setError(null) }}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: lieu === l ? "var(--color-primary-light)" : "var(--color-surface)",
                      border: `1.5px solid ${lieu === l ? "var(--color-primary)" : "var(--color-border)"}`,
                    }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: lieu === l ? "var(--color-primary)" : "var(--color-border)" }} />
                    <span className="text-sm font-medium" style={{ color: lieu === l ? "var(--color-primary-dark)" : "var(--color-text-secondary)" }}>
                      {l} {i === 0 && <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>(principal)</span>}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <input type="text" placeholder="Adresse du rendez-vous" value={lieu}
                onChange={e => { setLieu(e.target.value); setError(null) }} className="input-field" />
            )}

            <div className="mt-3">
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-muted)" }}>
                Ou saisir une autre adresse :
              </label>
              <input type="text" placeholder="Ex : 12 rue de la Paix, Paris" value={tousLieux.includes(lieu) ? "" : lieu}
                onChange={e => { setLieu(e.target.value); setError(null) }} className="input-field" />
            </div>
          </div>

          {/* Récapitulatif */}
          {date && heure && lieu && (
            <div className="rounded-xl p-4 mb-6" style={{ background: "var(--color-primary-light)", border: "1px solid rgba(0,179,125,0.2)" }}>
              <p className="text-sm font-semibold mb-2" style={{ color: "var(--color-primary-dark)" }}>Récapitulatif</p>
              <div className="flex flex-col gap-1 text-sm" style={{ color: "var(--color-primary-dark)" }}>
                <p>📅 {new Date(`${date}T${heure}:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à {heure}</p>
                <p>📍 {lieu}</p>
                <p>💰 {moniteur.tarif_horaire * duree} € ({duree} heure{duree > 1 ? "s" : ""} de conduite)</p>
              </div>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="mb-5 p-4 rounded-xl text-sm" style={{ background: "var(--color-error-light)", color: "var(--color-error)", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </div>
          )}

          {/* Bouton */}
          <button type="button" onClick={confirmer} className="btn-primary w-full" disabled={submitting}>
            {submitting ? "Envoi de la réservation…" : `Confirmer la réservation — ${moniteur.tarif_horaire * duree} €`}
          </button>

          <p className="text-xs text-center mt-4" style={{ color: "var(--color-text-muted)" }}>
            Le moniteur recevra votre demande et pourra l'accepter ou vous proposer un autre créneau.
          </p>
        </div>
      </div>
    </div>
  )
}
