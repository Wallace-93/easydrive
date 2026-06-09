"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import Link from "next/link"
import { Calendar, CheckCircle, Car, ClipboardList, Search, MessageCircle, User, GraduationCap, BarChart3, Lightbulb, Sparkles, Star } from "lucide-react"

type Profil = {
  prenom: string
  nom: string
  avatar_url: string | null
}

type Reservation = {
  id: string
  date_heure: string
  adresse_rdv: string
  statut: string
  montant: number
  moniteur_id: string
  moniteurs: {
    id: string
    tarif_horaire: number
    profiles: {
      prenom: string
      nom: string
      avatar_url: string | null
    }
  }
}

const STATUT_LABELS: Record<string, { label: string; couleur: string; fond: string }> = {
  en_attente: { label: "En attente", couleur: "#F59E0B", fond: "#FFFBEB" },
  confirmee: { label: "Confirmée", couleur: "#00B37D", fond: "#E6F9F1" },
  annulee: { label: "Annulée", couleur: "#EF4444", fond: "#FEF2F2" },
  terminee: { label: "Terminée", couleur: "#64748B", fond: "#F1F5F9" },
}

export default function DashboardEleve() {
  const [profil, setProfil] = useState<Profil | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [eleveId, setEleveId] = useState<string | null>(null)

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
        .select("prenom, nom, avatar_url")
        .eq("id", session.user.id)
        .single()

      if (profile) setProfil(profile)

      const { data: eleve } = await supabase
        .from("eleves")
        .select("id")
        .eq("user_id", session.user.id)
        .single()

      if (eleve) {
        setEleveId(eleve.id)

        const { data: res } = await supabase
          .from("reservations")
          .select("*, moniteurs (id, tarif_horaire, profiles:user_id (prenom, nom, avatar_url))")
          .eq("eleve_id", eleve.id)
          .order("date_heure", { ascending: false })

        if (res) setReservations(res)
      }

      setLoading(false)
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

  const now = new Date()
  const prochaines = reservations.filter(r => new Date(r.date_heure) >= now && r.statut !== "annulee")
  const passees = reservations.filter(r => new Date(r.date_heure) < now || r.statut === "terminee")
  const totalHeures = passees.filter(r => r.statut === "terminee").length

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      {/* En-tête */}
      <header className="border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-1" style={{ fontFamily: "var(--font-display)", textDecoration: "none" }}>
            <span className="text-xl font-extrabold" style={{ color: "var(--color-primary)" }}>Just</span>
            <span className="text-xl font-light" style={{ color: "var(--color-text)" }}>Conduite</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/profil" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>Mon profil</Link>
            <button
              onClick={() => {
                const supabase = createClient()
                supabase.auth.signOut().then(() => window.location.replace("/connexion"))
              }}
              className="text-sm font-medium"
              style={{ color: "var(--color-text-muted)", background: "none", border: "none", cursor: "pointer" }}
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Bienvenue */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Bonjour, {profil?.prenom || "Élève"} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
            Voici un aperçu de votre parcours de conduite.
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Leçons à venir", value: prochaines.length, icon: <Calendar size={20} /> },
            { label: "Leçons terminées", value: totalHeures, icon: <CheckCircle size={20} /> },
            { label: "Heures de conduite", value: `${totalHeures}h`, icon: <Car size={20} /> },
            { label: "Réservations", value: reservations.length, icon: <ClipboardList size={20} /> },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl p-4" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>{stat.icon}</div>
              <p className="text-2xl font-bold mt-2" style={{ fontFamily: "var(--font-display)" }}>{stat.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Code de la route */}
        <Link href="/code" style={{ textDecoration: "none" }}>
          <div className="rounded-2xl p-6 mb-4 transition-all" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--color-primary)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,179,125,0.1)" }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.boxShadow = "none" }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "var(--color-primary-light)" }}>
                <GraduationCap size={22} style={{ color: "var(--color-primary)" }} />
              </div>
              <div>
                <p className="text-base font-bold">Code de la route gratuit</p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>69 questions · 10 thèmes · Examens blancs · Suivi de progression</p>
              </div>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--color-text-muted)" strokeWidth="2.5" className="flex-shrink-0 ml-auto">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        {/* Progression + Conseils */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Link href="/progression" style={{ textDecoration: "none" }}>
            <div className="rounded-2xl p-5 transition-all" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--color-primary)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--color-border)")}>
              <div className="flex items-center gap-3">
                <BarChart3 size={22} style={{ color: "var(--color-text-secondary)" }} />
                <div>
                  <p className="text-sm font-bold">Ma progression</p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Score, badges et suivi détaillé</p>
                </div>
              </div>
            </div>
          </Link>
          <Link href="/conseils" style={{ textDecoration: "none" }}>
            <div className="rounded-2xl p-5 transition-all" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--color-primary)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--color-border)")}>
              <div className="flex items-center gap-3">
                <Lightbulb size={22} style={{ color: "var(--color-text-secondary)" }} />
                <div>
                  <p className="text-sm font-bold">Conseils et astuces</p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Articles pour réussir votre permis</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Matching */}
        <Link href="/matching" style={{ textDecoration: "none" }}>
          <div className="rounded-2xl p-6 mb-6 transition-all" style={{ background: "linear-gradient(135deg, var(--color-primary), #009966)", border: "none" }}
            onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)", e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,179,125,0.3)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "none", e.currentTarget.style.boxShadow = "none")}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
                <Sparkles size={22} />
              </div>
              <div>
                <p className="text-base font-bold" style={{ color: "white" }}>Trouver mon moniteur idéal</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.8)" }}>Recommandation personnalisée basée sur vos besoins et les avis des élèves</p>
              </div>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5" className="flex-shrink-0 ml-auto">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link href="/resultats" style={{ textDecoration: "none" }}>
            <div className="rounded-2xl p-5 transition-all" style={{ background: "var(--color-primary-light)", border: "1px solid transparent" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--color-primary)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "transparent")}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--color-primary)", color: "white" }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--color-primary-dark)" }}>Trouver un moniteur</p>
                  <p className="text-xs" style={{ color: "var(--color-primary)" }}>Parcourir les profils disponibles</p>
                </div>
              </div>
            </div>
          </Link>
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
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Discuter avec vos moniteurs</p>
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
        </div>

        {/* Prochaines leçons */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>Prochaines leçons</h2>
          {prochaines.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
              <Calendar size={32} style={{ color: "var(--color-text-muted)", margin: "0 auto 12px" }} />
              <p className="text-sm font-semibold mb-1">Aucune leçon prévue</p>
              <p className="text-xs mb-4" style={{ color: "var(--color-text-muted)" }}>
                Trouvez un moniteur et réservez votre première leçon de conduite.
              </p>
              <Link href="/resultats" className="btn-primary inline-block text-sm" style={{ textDecoration: "none", padding: "10px 24px" }}>
                Trouver un moniteur →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {prochaines.map(r => {
                const date = new Date(r.date_heure)
                const statut = STATUT_LABELS[r.statut] || STATUT_LABELS.en_attente
                const moniteurPrenom = r.moniteurs?.profiles?.prenom || "Moniteur"
                const moniteurNom = r.moniteurs?.profiles?.nom || ""
                return (
                  <div key={r.id} className="rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                    style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                        style={{ background: "var(--color-primary-light)" }}>
                        <span className="text-xs font-bold" style={{ color: "var(--color-primary)", lineHeight: 1 }}>
                          {date.toLocaleDateString("fr-FR", { day: "numeric" })}
                        </span>
                        <span className="text-[10px] uppercase font-semibold" style={{ color: "var(--color-primary-dark)" }}>
                          {date.toLocaleDateString("fr-FR", { month: "short" })}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{moniteurPrenom} {moniteurNom}</p>
                        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                          {date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {r.adresse_rdv && (
                          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>📍 {r.adresse_rdv}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full"
                        style={{ background: statut.fond, color: statut.couleur }}>
                        {statut.label}
                      </span>
                      <span className="text-sm font-bold" style={{ color: "var(--color-primary)" }}>
                        {r.montant || r.moniteurs?.tarif_horaire || "—"} €
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Historique */}
        {passees.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>Historique</h2>
            <div className="flex flex-col gap-3">
              {passees.slice(0, 5).map(r => {
                const date = new Date(r.date_heure)
                const statut = STATUT_LABELS[r.statut] || STATUT_LABELS.terminee
                const moniteurPrenom = r.moniteurs?.profiles?.prenom || "Moniteur"
                const moniteurNom = r.moniteurs?.profiles?.nom || ""
                return (
                  <div key={r.id} className="rounded-xl p-4 flex items-center justify-between"
                    style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex flex-col items-center justify-center flex-shrink-0"
                        style={{ background: "var(--color-surface-hover)" }}>
                        <span className="text-xs font-bold" style={{ color: "var(--color-text-secondary)", lineHeight: 1 }}>
                          {date.toLocaleDateString("fr-FR", { day: "numeric" })}
                        </span>
                        <span className="text-[10px] uppercase" style={{ color: "var(--color-text-muted)" }}>
                          {date.toLocaleDateString("fr-FR", { month: "short" })}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{moniteurPrenom} {moniteurNom}</p>
                        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                          {date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full"
                        style={{ background: statut.fond, color: statut.couleur }}>
                        {statut.label}
                      </span>
                      {r.statut === "terminee" && (
                        <Link href={`/avis/${r.moniteur_id}`} className="text-xs font-semibold px-3 py-1 rounded-full"
                          style={{ background: "var(--color-primary-light)", color: "var(--color-primary-dark)", textDecoration: "none" }}>
                          ★ Évaluer
                        </Link>
                      )}
                    </div>
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
