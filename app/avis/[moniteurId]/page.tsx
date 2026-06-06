"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect, use } from "react"
import { createClient } from "@/lib/supabase-client"
import Link from "next/link"

export default function LaisserAvis({ params }: { params: Promise<{ moniteurId: string }> }) {
  const { moniteurId } = use(params)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dejaNote, setDejaNote] = useState(false)
  const [eleveId, setEleveId] = useState<string | null>(null)
  const [moniteurNom, setMoniteurNom] = useState("")
  const [note, setNote] = useState(0)
  const [hoverNote, setHoverNote] = useState(0)
  const [commentaire, setCommentaire] = useState("")

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        window.location.replace("/connexion")
        return
      }

      const { data: eleve } = await supabase
        .from("eleves")
        .select("id")
        .eq("user_id", session.user.id)
        .single()

      if (!eleve) {
        setError("Seuls les élèves peuvent laisser un avis.")
        setLoading(false)
        return
      }

      setEleveId(eleve.id)

      const { data: moniteur } = await supabase
        .from("moniteurs")
        .select("id, profiles:user_id (prenom, nom)")
        .eq("id", moniteurId)
        .single()

      if (!moniteur) {
        setError("Moniteur introuvable.")
        setLoading(false)
        return
      }

      setMoniteurNom(`${(moniteur as any).profiles?.prenom || ""} ${(moniteur as any).profiles?.nom || ""}`)

      // Vérifier si l'élève a déjà noté ce moniteur
      const { data: existant } = await supabase
        .from("avis")
        .select("id")
        .eq("eleve_id", eleve.id)
        .eq("moniteur_id", moniteurId)
        .maybeSingle()

      if (existant) {
        setDejaNote(true)
      }

      setLoading(false)
    }
    load()
  }, [moniteurId])

  async function soumettre() {
    if (note === 0) { setError("Veuillez attribuer une note."); return }
    if (!commentaire.trim()) { setError("Veuillez écrire un commentaire."); return }
    if (!eleveId) return

    setSubmitting(true)
    setError(null)

    const supabase = createClient()

    const { error: avisError } = await supabase.from("avis").insert({
      eleve_id: eleveId,
      moniteur_id: moniteurId,
      note,
      commentaire: commentaire.trim(),
    })

    if (avisError) {
      setError("Erreur lors de l'envoi de l'avis : " + avisError.message)
      setSubmitting(false)
      return
    }

    // Mettre à jour la note moyenne du moniteur
    const { data: tousAvis } = await supabase
      .from("avis")
      .select("note")
      .eq("moniteur_id", moniteurId)

    if (tousAvis && tousAvis.length > 0) {
      const moyenne = tousAvis.reduce((sum, a) => sum + a.note, 0) / tousAvis.length
      await supabase
        .from("moniteurs")
        .update({ note_moyenne: Math.round(moyenne * 10) / 10, nb_avis: tousAvis.length })
        .eq("id", moniteurId)
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
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>Merci pour votre avis !</h1>
          <p className="text-sm mb-8" style={{ color: "var(--color-text-secondary)" }}>
            Votre retour aide les autres élèves à choisir leur moniteur.
          </p>
          <Link href="/dashboard" className="btn-primary inline-block" style={{ textDecoration: "none" }}>
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    )
  }

  if (dejaNote) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--color-background)" }}>
        <div className="w-full max-w-md text-center">
          <p className="text-3xl mb-4">⭐</p>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>Avis déjà envoyé</h1>
          <p className="text-sm mb-8" style={{ color: "var(--color-text-secondary)" }}>
            Vous avez déjà laissé un avis pour {moniteurNom}.
          </p>
          <Link href="/dashboard" className="btn-primary inline-block" style={{ textDecoration: "none" }}>
            Retour au tableau de bord
          </Link>
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
          <Link href="/dashboard" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>
            ← Tableau de bord
          </Link>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>Évaluer {moniteurNom}</h1>
        <p className="text-sm mb-8" style={{ color: "var(--color-text-secondary)" }}>
          Partagez votre expérience pour aider les futurs élèves.
        </p>

        <div className="rounded-2xl p-6 sm:p-8" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          {/* Note */}
          <div className="mb-8 text-center">
            <label className="block text-sm font-semibold mb-4">Votre note</label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <svg key={n} width="40" height="40"
                  fill={(hoverNote || note) >= n ? "#F59E0B" : "none"}
                  viewBox="0 0 24 24" stroke="#F59E0B" strokeWidth="1.5"
                  className="cursor-pointer transition-transform hover:scale-110"
                  onMouseEnter={() => setHoverNote(n)}
                  onMouseLeave={() => setHoverNote(0)}
                  onClick={() => { setNote(n); setError(null) }}>
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              ))}
            </div>
            <p className="text-sm mt-2" style={{ color: "var(--color-text-muted)" }}>
              {note === 0 ? "Cliquez pour noter" : ["", "Décevant", "Moyen", "Bien", "Très bien", "Excellent"][note]}
            </p>
          </div>

          {/* Commentaire */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Votre commentaire</label>
            <textarea
              placeholder="Décrivez votre expérience : ponctualité, pédagogie, patience, ambiance…"
              value={commentaire}
              onChange={e => { setCommentaire(e.target.value); setError(null) }}
              rows={5}
              className="input-field"
              style={{ resize: "vertical" }}
            />
          </div>

          {error && (
            <div className="mb-5 p-4 rounded-xl text-sm" style={{ background: "var(--color-error-light)", color: "var(--color-error)", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </div>
          )}

          <button type="button" onClick={soumettre} className="btn-primary w-full" disabled={submitting}>
            {submitting ? "Envoi en cours…" : "Publier mon avis"}
          </button>
        </div>
      </div>
    </div>
  )
}
