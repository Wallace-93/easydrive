"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import Link from "next/link"
import { envoyerNotification } from "@/lib/notifications"

type Reservation = {
  id: string
  date_heure: string
  adresse_rdv: string
  statut: string
  montant: number
  eleve_id: string
  eleves: {
    user_id: string
    profiles: {
      prenom: string
      nom: string
    } | null
  } | null
}

const STATUT_LABELS: Record<string, { label: string; couleur: string; fond: string }> = {
  en_attente: { label: "En attente", couleur: "#F59E0B", fond: "#FFFBEB" },
  confirmee: { label: "Confirmée", couleur: "#00B37D", fond: "#E6F9F1" },
  annulee: { label: "Annulée", couleur: "#EF4444", fond: "#FEF2F2" },
  terminee: { label: "Terminée", couleur: "#64748B", fond: "#F1F5F9" },
}

export default function DashboardMoniteur() {
  const [profil, setProfil] = useState<any>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [moniteurId, setMoniteurId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      window.location.replace("/connexion")
      return
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("prenom, nom, avatar_url")
      .eq("id", session.user.id)
      .single()

    if (profile) setProfil(profile)

    const { data: moniteur } = await supabase
      .from("moniteurs")
      .select("id, tarif_horaire")
      .eq("user_id", session.user.id)
      .single()

    if (moniteur) {
      setMoniteurId(moniteur.id)

      const { data: res } = await supabase
        .from("reservations")
        .select("*, eleves (user_id, profiles:user_id (prenom, nom))")
        .eq("moniteur_id", moniteur.id)
        .order("date_heure", { ascending: false })

      if (res) setReservations(res)
    }

    setLoading(false)
  }

  async function changerStatut(resId: string, statut: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from("reservations")
      .update({ statut })
      .eq("id", resId)

    if (!error) {
      setReservations(prev => prev.map(r => r.id === resId ? { ...r, statut } : r))

      // Récupérer les infos pour la notification
      const res = reservations.find(r => r.id === resId)
      if (res) {
        const eleveUserId = res.eleves?.user_id
        if (eleveUserId) {
          const { data: eleveAuth } = await supabase.from("profiles").select("prenom").eq("id", eleveUserId).single()
          const date = new Date(res.date_heure)

          if (statut === "confirmee") {
            envoyerNotification("reservation_confirmee", "", {
              elevePrenom: eleveAuth?.prenom || "Élève",
              moniteurPrenom: profil?.prenom || "Moniteur",
              moniteurNom: profil?.nom || "",
              date: date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }),
              heure: date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
              lieu: res.adresse_rdv || "",
              montant: res.montant || "",
            })
          } else if (statut === "annulee") {
            envoyerNotification("reservation_annulee", "", {
              prenom: eleveAuth?.prenom || "Élève",
              date: date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }),
              heure: date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
            })
          }
        }
      }
    }
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

  const now = new Date()
  const enAttente = reservations.filter(r => r.statut === "en_attente")
  const confirmees = reservations.filter(r => r.statut === "confirmee" && new Date(r.date_heure) >= now)
  const terminees = reservations.filter(r => r.statut === "terminee")
  const revenus = terminees.reduce((sum, r) => sum + (r.montant || 0), 0)
  const commission = Math.round(revenus * 0.15)

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      <header className="border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-1" style={{ fontFamily: "var(--font-display)", textDecoration: "none" }}>
            <span className="text-xl font-extrabold" style={{ color: "var(--color-primary)" }}>Just</span>
            <span className="text-xl font-light" style={{ color: "var(--color-text)" }}>Conduite</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/profil" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>Mon profil</Link>
            <button onClick={() => { createClient().auth.signOut().then(() => window.location.replace("/connexion")) }}
              className="text-sm font-medium" style={{ color: "var(--color-text-muted)", background: "none", border: "none", cursor: "pointer" }}>
              Se déconnecter
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Bonjour, {profil?.prenom || "Moniteur"} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
            Gérez vos leçons et suivez votre activité.
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "En attente", value: enAttente.length, icon: "⏳" },
            { label: "À venir", value: confirmees.length, icon: "📅" },
            { label: "Terminées", value: terminees.length, icon: "✅" },
            { label: "Revenus nets", value: `${revenus - commission} €`, icon: "💰" },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl p-4" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
              <span className="text-2xl">{stat.icon}</span>
              <p className="text-2xl font-bold mt-2" style={{ fontFamily: "var(--font-display)" }}>{stat.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{stat.label}</p>
            </div>
          ))}
        </div>



        {/* Actions rapides */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link href="/messages" style={{ textDecoration: "none" }}>
            <div className="rounded-2xl p-5 transition-all" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--color-primary)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--color-border)")}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--color-surface-hover)", color: "var(--color-text-secondary)" }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold">Mes messages</p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Discuter avec vos élèves</p>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/profil" style={{ textDecoration: "none" }}>
            <div className="rounded-2xl p-5 transition-all" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--color-primary)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--color-border)")}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--color-surface-hover)", color: "var(--color-text-secondary)" }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold">Mon profil</p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Modifier mes informations</p>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/vehicules" style={{ textDecoration: "none" }}>
            <div className="rounded-2xl p-5 transition-all" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--color-primary)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--color-border)")}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--color-surface-hover)", color: "var(--color-text-secondary)" }}>
                  <span className="text-lg">🚗</span>
                </div>
                <div>
                  <p className="text-sm font-bold">Véhicules double commande</p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Louer ou proposer un véhicule</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Demandes en attente */}
        {enAttente.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Demandes en attente
              <span className="ml-2 text-sm font-normal px-2.5 py-0.5 rounded-full" style={{ background: "#FFFBEB", color: "#F59E0B" }}>
                {enAttente.length}
              </span>
            </h2>
            <div className="flex flex-col gap-3">
              {enAttente.map(r => {
                const date = new Date(r.date_heure)
                const elevePrenom = r.eleves?.profiles?.prenom || "Élève"
                const eleveNom = r.eleves?.profiles?.nom || ""
                return (
                  <div key={r.id} className="rounded-2xl p-5" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0" style={{ background: "#FFFBEB" }}>
                          <span className="text-xs font-bold" style={{ color: "#F59E0B", lineHeight: 1 }}>
                            {date.toLocaleDateString("fr-FR", { day: "numeric" })}
                          </span>
                          <span className="text-[10px] uppercase font-semibold" style={{ color: "#D97706" }}>
                            {date.toLocaleDateString("fr-FR", { month: "short" })}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{elevePrenom} {eleveNom}</p>
                          <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                            {date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                          {r.adresse_rdv && <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>📍 {r.adresse_rdv}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => changerStatut(r.id, "confirmee")}
                          className="text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                          style={{ background: "var(--color-primary)", color: "white", border: "none", cursor: "pointer" }}>
                          Accepter
                        </button>
                        <button onClick={() => changerStatut(r.id, "annulee")}
                          className="text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                          style={{ background: "var(--color-error-light)", color: "var(--color-error)", border: "none", cursor: "pointer" }}>
                          Refuser
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Prochaines leçons */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>Prochaines leçons</h2>
          {confirmees.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
              <p className="text-3xl mb-3">📅</p>
              <p className="text-sm font-semibold mb-1">Aucune leçon confirmée à venir</p>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Les leçons confirmées apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {confirmees.map(r => {
                const date = new Date(r.date_heure)
                const elevePrenom = r.eleves?.profiles?.prenom || "Élève"
                const eleveNom = r.eleves?.profiles?.nom || ""
                return (
                  <div key={r.id} className="rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                    style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0" style={{ background: "var(--color-primary-light)" }}>
                        <span className="text-xs font-bold" style={{ color: "var(--color-primary)", lineHeight: 1 }}>
                          {date.toLocaleDateString("fr-FR", { day: "numeric" })}
                        </span>
                        <span className="text-[10px] uppercase font-semibold" style={{ color: "var(--color-primary-dark)" }}>
                          {date.toLocaleDateString("fr-FR", { month: "short" })}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{elevePrenom} {eleveNom}</p>
                        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                          {date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {r.adresse_rdv && <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>📍 {r.adresse_rdv}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold" style={{ color: "var(--color-primary)" }}>{r.montant || "—"} €</span>
                      <Link href={`/messages/${r.id}`} className="text-xs font-medium px-3 py-1.5 rounded-lg"
                        style={{ background: "var(--color-surface-hover)", color: "var(--color-text-secondary)", textDecoration: "none" }}>
                        Message
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Historique */}
        {terminees.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>Historique</h2>
            <div className="flex flex-col gap-3">
              {terminees.slice(0, 5).map(r => {
                const date = new Date(r.date_heure)
                const elevePrenom = r.eleves?.profiles?.prenom || "Élève"
                const eleveNom = r.eleves?.profiles?.nom || ""
                return (
                  <div key={r.id} className="rounded-xl p-4 flex items-center justify-between"
                    style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex flex-col items-center justify-center flex-shrink-0" style={{ background: "var(--color-surface-hover)" }}>
                        <span className="text-xs font-bold" style={{ color: "var(--color-text-secondary)", lineHeight: 1 }}>
                          {date.toLocaleDateString("fr-FR", { day: "numeric" })}
                        </span>
                        <span className="text-[10px] uppercase" style={{ color: "var(--color-text-muted)" }}>
                          {date.toLocaleDateString("fr-FR", { month: "short" })}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{elevePrenom} {eleveNom}</p>
                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                          {date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold" style={{ color: "var(--color-text-muted)" }}>{r.montant || "—"} €</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
