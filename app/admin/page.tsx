"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import Link from "next/link"

const ADMIN_EMAILS = ["fallies.project@gmail.com"]

type Stats = {
  totalEleves: number
  totalMoniteurs: number
  moniteursVerifies: number
  moniteursEnAttente: number
  totalReservations: number
  reservationsEnAttente: number
  reservationsConfirmees: number
  reservationsTerminees: number
  revenuTotal: number
  commissionTotale: number
  totalMessages: number
  totalAvis: number
  totalVehicules: number
}

type MoniteurAttente = {
  id: string
  user_id: string
  diplome: string
  diplome_url: string | null
  experience_annees: number
  zone: string
  created_at: string
  profiles: { prenom: string; nom: string; telephone: string; } | null
}

type ReservationRecente = {
  id: string
  date_heure: string
  statut: string
  montant: number
  adresse_rdv: string
  eleves: { profiles: { prenom: string; nom: string } | null } | null
  moniteurs: { profiles: { prenom: string; nom: string } | null } | null
}

export default function Admin() {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [moniteursAttente, setMoniteursAttente] = useState<MoniteurAttente[]>([])
  const [reservationsRecentes, setReservationsRecentes] = useState<ReservationRecente[]>([])
  const [activeTab, setActiveTab] = useState<"dashboard" | "moniteurs" | "reservations">("dashboard")

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session || !ADMIN_EMAILS.includes(session.user.email || "")) {
        setLoading(false)
        return
      }

      setAuthorized(true)

      // Stats
      const [eleves, moniteurs, monVerifies, reservations, messages, avis, vehicules] = await Promise.all([
        supabase.from("eleves").select("id", { count: "exact", head: true }),
        supabase.from("moniteurs").select("id", { count: "exact", head: true }),
        supabase.from("moniteurs").select("id", { count: "exact", head: true }).eq("verifie", true),
        supabase.from("reservations").select("*"),
        supabase.from("messages").select("id", { count: "exact", head: true }),
        supabase.from("avis").select("id", { count: "exact", head: true }),
        supabase.from("vehicules").select("id", { count: "exact", head: true }),
      ])

      const resData = reservations.data || []
      const revenuTotal = resData.filter(r => r.statut === "terminee").reduce((s, r) => s + (r.montant || 0), 0)

      setStats({
        totalEleves: eleves.count || 0,
        totalMoniteurs: moniteurs.count || 0,
        moniteursVerifies: monVerifies.count || 0,
        moniteursEnAttente: (moniteurs.count || 0) - (monVerifies.count || 0),
        totalReservations: resData.length,
        reservationsEnAttente: resData.filter(r => r.statut === "en_attente").length,
        reservationsConfirmees: resData.filter(r => r.statut === "confirmee").length,
        reservationsTerminees: resData.filter(r => r.statut === "terminee").length,
        revenuTotal,
        commissionTotale: Math.round(revenuTotal * 0.15),
        totalMessages: messages.count || 0,
        totalAvis: avis.count || 0,
        totalVehicules: vehicules.count || 0,
      })

      // Moniteurs en attente
      const { data: monAtt } = await supabase
        .from("moniteurs")
        .select("*, profiles:user_id (prenom, nom, telephone)")
        .eq("verifie", false)
        .order("created_at", { ascending: false })

      setMoniteursAttente(monAtt || [])

      // Réservations récentes
      const { data: resRec } = await supabase
        .from("reservations")
        .select("*, eleves (profiles:user_id (prenom, nom)), moniteurs (profiles:user_id (prenom, nom))")
        .order("created_at", { ascending: false })
        .limit(20)

      setReservationsRecentes(resRec || [])

      setLoading(false)
    }
    load()
  }, [])

  async function verifierMoniteur(moniteurId: string) {
    const supabase = createClient()
    await supabase.from("moniteurs").update({ verifie: true }).eq("id", moniteurId)
    setMoniteursAttente(prev => prev.filter(m => m.id !== moniteurId))
    if (stats) setStats({ ...stats, moniteursVerifies: stats.moniteursVerifies + 1, moniteursEnAttente: stats.moniteursEnAttente - 1 })
  }

  async function refuserMoniteur(moniteurId: string) {
    const supabase = createClient()
    await supabase.from("moniteurs").delete().eq("id", moniteurId)
    setMoniteursAttente(prev => prev.filter(m => m.id !== moniteurId))
    if (stats) setStats({ ...stats, totalMoniteurs: stats.totalMoniteurs - 1, moniteursEnAttente: stats.moniteursEnAttente - 1 })
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

  if (!authorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--color-background)" }}>
        <p className="text-lg font-semibold mb-2">Accès refusé</p>
        <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>Vous n'avez pas les droits d'administration.</p>
        <Link href="/" className="btn-primary" style={{ textDecoration: "none" }}>Retour à l'accueil</Link>
      </div>
    )
  }

  const TABS = [
    { id: "dashboard" as const, label: "Vue d'ensemble" },
    { id: "moniteurs" as const, label: `Moniteurs (${stats?.moniteursEnAttente || 0} en attente)` },
    { id: "reservations" as const, label: "Réservations" },
  ]

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      <header className="border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-baseline gap-1" style={{ fontFamily: "var(--font-display)", textDecoration: "none" }}>
              <span className="text-xl font-extrabold" style={{ color: "var(--color-primary)" }}>Just</span>
              <span className="text-xl font-light" style={{ color: "var(--color-text)" }}>Conduite</span>
            </Link>
            <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: "var(--color-error-light)", color: "var(--color-error)" }}>ADMIN</span>
          </div>
          <button onClick={() => { createClient().auth.signOut().then(() => window.location.replace("/connexion")) }}
            className="text-sm font-medium" style={{ color: "var(--color-text-muted)", background: "none", border: "none", cursor: "pointer" }}>
            Se déconnecter
          </button>
        </div>

        {/* Onglets */}
        <div className="max-w-6xl mx-auto px-4 flex gap-1">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="text-sm font-medium px-4 py-2.5 transition-colors"
              style={{
                color: activeTab === tab.id ? "var(--color-primary)" : "var(--color-text-muted)",
                borderBottom: activeTab === tab.id ? "2px solid var(--color-primary)" : "2px solid transparent",
                background: "none", border: "none", borderBottomStyle: "solid", borderBottomWidth: 2,
                borderBottomColor: activeTab === tab.id ? "var(--color-primary)" : "transparent",
                cursor: "pointer",
              }}>
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ═══ VUE D'ENSEMBLE ═══ */}
        {activeTab === "dashboard" && stats && (
          <div>
            <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>Vue d'ensemble</h1>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Élèves inscrits", value: stats.totalEleves, icon: "👤" },
                { label: "Moniteurs vérifiés", value: stats.moniteursVerifies, icon: "🎓" },
                { label: "En attente", value: stats.moniteursEnAttente, icon: "⏳", alert: stats.moniteursEnAttente > 0 },
                { label: "Réservations", value: stats.totalReservations, icon: "📅" },
                { label: "Confirmées", value: stats.reservationsConfirmees, icon: "✅" },
                { label: "Terminées", value: stats.reservationsTerminees, icon: "🏁" },
                { label: "Revenu total", value: `${stats.revenuTotal} €`, icon: "💰" },
                { label: "Commission (15 %)", value: `${stats.commissionTotale} €`, icon: "📊" },
                { label: "Messages", value: stats.totalMessages, icon: "💬" },
                { label: "Avis", value: stats.totalAvis, icon: "⭐" },
                { label: "Véhicules", value: stats.totalVehicules, icon: "🚗" },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-4" style={{
                  background: "var(--color-surface)",
                  border: `1px solid ${(s as any).alert ? "var(--color-error)" : "var(--color-border)"}`,
                }}>
                  <span className="text-xl">{s.icon}</span>
                  <p className="text-xl font-bold mt-1" style={{ fontFamily: "var(--font-display)" }}>{s.value}</p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ MONITEURS ═══ */}
        {activeTab === "moniteurs" && (
          <div>
            <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>Moniteurs en attente de vérification</h1>

            {moniteursAttente.length === 0 ? (
              <div className="rounded-2xl p-8 text-center" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                <p className="text-3xl mb-3">✅</p>
                <p className="text-sm font-semibold">Aucun moniteur en attente</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {moniteursAttente.map(m => (
                  <div key={m.id} className="rounded-2xl p-5" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1">
                        <p className="text-base font-bold">{m.profiles?.prenom} {m.profiles?.nom}</p>
                        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                          📞 {m.profiles?.telephone} · 🎓 {m.diplome} · 📍 {m.zone} · {m.experience_annees} an{m.experience_annees > 1 ? "s" : ""} d'exp.
                        </p>
                        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                          Inscrit le {new Date(m.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                        {m.diplome_url ? (
                          <a href={m.diplome_url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold mt-2"
                            style={{ color: "var(--color-primary)" }}>
                            📎 Voir le diplôme
                          </a>
                        ) : (
                          <p className="text-xs mt-2" style={{ color: "var(--color-error)" }}>⚠️ Aucun diplôme téléversé</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => verifierMoniteur(m.id)}
                          className="text-xs font-semibold px-4 py-2 rounded-lg"
                          style={{ background: "var(--color-primary)", color: "white", border: "none", cursor: "pointer" }}>
                          Valider
                        </button>
                        <button onClick={() => refuserMoniteur(m.id)}
                          className="text-xs font-semibold px-4 py-2 rounded-lg"
                          style={{ background: "var(--color-error-light)", color: "var(--color-error)", border: "none", cursor: "pointer" }}>
                          Refuser
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ RÉSERVATIONS ═══ */}
        {activeTab === "reservations" && (
          <div>
            <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>Réservations récentes</h1>

            {reservationsRecentes.length === 0 ? (
              <div className="rounded-2xl p-8 text-center" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                <p className="text-sm">Aucune réservation pour le moment.</p>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                      {["Date", "Élève", "Moniteur", "Lieu", "Montant", "Statut"].map(h => (
                        <th key={h} className="text-xs font-semibold text-left px-4 py-3" style={{ color: "var(--color-text-muted)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reservationsRecentes.map(r => {
                      const date = new Date(r.date_heure)
                      const statutColors: Record<string, string> = { en_attente: "#F59E0B", confirmee: "#00B37D", annulee: "#EF4444", terminee: "#64748B" }
                      const statutLabels: Record<string, string> = { en_attente: "En attente", confirmee: "Confirmée", annulee: "Annulée", terminee: "Terminée" }
                      return (
                        <tr key={r.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                          <td className="text-xs px-4 py-3">{date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" })} {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</td>
                          <td className="text-xs px-4 py-3 font-medium">{(r.eleves as any)?.profiles?.prenom} {(r.eleves as any)?.profiles?.nom}</td>
                          <td className="text-xs px-4 py-3 font-medium">{(r.moniteurs as any)?.profiles?.prenom} {(r.moniteurs as any)?.profiles?.nom}</td>
                          <td className="text-xs px-4 py-3" style={{ color: "var(--color-text-muted)" }}>{r.adresse_rdv || "—"}</td>
                          <td className="text-xs px-4 py-3 font-bold" style={{ color: "var(--color-primary)" }}>{r.montant || "—"} €</td>
                          <td className="text-xs px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                              style={{ background: `${statutColors[r.statut]}15`, color: statutColors[r.statut] }}>
                              {statutLabels[r.statut] || r.statut}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
