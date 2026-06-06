"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import Link from "next/link"

type Conversation = {
  reservation_id: string
  date_heure: string
  statut: string
  autre_prenom: string
  autre_nom: string
  dernier_message: string | null
  dernier_message_date: string | null
  non_lus: number
}

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<string>("")

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        window.location.replace("/connexion")
        return
      }

      // Récupérer le rôle
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single()

      const userRole = profile?.role || "eleve"
      setRole(userRole)

      let reservations: any[] = []

      if (userRole === "eleve") {
        const { data: eleve } = await supabase
          .from("eleves")
          .select("id")
          .eq("user_id", session.user.id)
          .single()

        if (eleve) {
          const { data } = await supabase
            .from("reservations")
            .select("id, date_heure, statut, moniteurs (user_id, profiles:user_id (prenom, nom))")
            .eq("eleve_id", eleve.id)
            .neq("statut", "annulee")
            .order("date_heure", { ascending: false })

          reservations = (data || []).map(r => ({
            reservation_id: r.id,
            date_heure: r.date_heure,
            statut: r.statut,
            autre_prenom: (r as any).moniteurs?.profiles?.prenom || "Moniteur",
            autre_nom: (r as any).moniteurs?.profiles?.nom || "",
          }))
        }
      } else {
        const { data: moniteur } = await supabase
          .from("moniteurs")
          .select("id")
          .eq("user_id", session.user.id)
          .single()

        if (moniteur) {
          const { data } = await supabase
            .from("reservations")
            .select("id, date_heure, statut, eleves (user_id, profiles:user_id (prenom, nom))")
            .eq("moniteur_id", moniteur.id)
            .neq("statut", "annulee")
            .order("date_heure", { ascending: false })

          reservations = (data || []).map(r => ({
            reservation_id: r.id,
            date_heure: r.date_heure,
            statut: r.statut,
            autre_prenom: (r as any).eleves?.profiles?.prenom || "Élève",
            autre_nom: (r as any).eleves?.profiles?.nom || "",
          }))
        }
      }

      // Récupérer le dernier message et les non-lus pour chaque réservation
      const convos: Conversation[] = []
      for (const r of reservations) {
        const { data: msgs } = await supabase
          .from("messages")
          .select("contenu, created_at, lu, sender_id")
          .eq("reservation_id", r.reservation_id)
          .order("created_at", { ascending: false })
          .limit(1)

        const { count } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("reservation_id", r.reservation_id)
          .eq("lu", false)
          .neq("sender_id", session.user.id)

        convos.push({
          ...r,
          dernier_message: msgs?.[0]?.contenu || null,
          dernier_message_date: msgs?.[0]?.created_at || null,
          non_lus: count || 0,
        })
      }

      setConversations(convos)
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
        <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>Messages</h1>

        {conversations.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <p className="text-3xl mb-3">💬</p>
            <p className="text-sm font-semibold mb-1">Aucune conversation</p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {role === "eleve"
                ? "Réservez une leçon pour démarrer une conversation avec un moniteur."
                : "Vos conversations avec les élèves apparaîtront ici."
              }
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {conversations.map(c => {
              const date = new Date(c.date_heure)
              return (
                <Link key={c.reservation_id} href={`/messages/${c.reservation_id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="rounded-xl p-4 flex items-center gap-4 transition-all"
                    style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--color-primary)")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--color-border)")}>
                    <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                      style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>
                      {(c.autre_prenom[0] || "").toUpperCase()}{(c.autre_nom[0] || "").toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">{c.autre_prenom} {c.autre_nom}</p>
                        {c.non_lus > 0 && (
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                            style={{ background: "var(--color-primary)", color: "white" }}>
                            {c.non_lus}
                          </span>
                        )}
                      </div>
                      <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>
                        {c.dernier_message || `Leçon du ${date.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
