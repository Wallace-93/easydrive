"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect, useRef, use } from "react"
import { createClient } from "@/lib/supabase-client"
import Link from "next/link"

type Message = {
  id: string
  contenu: string
  sender_id: string
  lu: boolean
  created_at: string
}

export default function Conversation({ params }: { params: Promise<{ reservationId: string }> }) {
  const { reservationId } = use(params)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [autreNom, setAutreNom] = useState("")
  const [reservation, setReservation] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    load()
    const interval = setInterval(loadMessages, 5000)
    return () => clearInterval(interval)
  }, [reservationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function load() {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      window.location.replace("/connexion")
      return
    }

    setUserId(session.user.id)

    // Récupérer la réservation avec les infos des deux participants
    const { data: res } = await supabase
      .from("reservations")
      .select("*, eleves (user_id, profiles:user_id (prenom, nom)), moniteurs (user_id, profiles:user_id (prenom, nom))")
      .eq("id", reservationId)
      .single()

    if (res) {
      setReservation(res)
      const eleveUserId = (res as any).eleves?.user_id
      const moniteurUserId = (res as any).moniteurs?.user_id

      if (session.user.id === eleveUserId) {
        const p = (res as any).moniteurs?.profiles
        setAutreNom(`${p?.prenom || "Moniteur"} ${p?.nom || ""}`)
      } else {
        const p = (res as any).eleves?.profiles
        setAutreNom(`${p?.prenom || "Élève"} ${p?.nom || ""}`)
      }
    }

    await loadMessages()
    setLoading(false)
  }

  async function loadMessages() {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("reservation_id", reservationId)
      .order("created_at", { ascending: true })

    if (data) {
      setMessages(data)

      // Marquer les messages reçus comme lus
      const nonLus = data.filter(m => m.sender_id !== session.user.id && !m.lu)
      for (const m of nonLus) {
        await supabase.from("messages").update({ lu: true }).eq("id", m.id)
      }
    }
  }

  async function envoyer() {
    if (!newMessage.trim() || !userId) return
    setSending(true)

    const supabase = createClient()
    const { error } = await supabase.from("messages").insert({
      reservation_id: reservationId,
      sender_id: userId,
      contenu: newMessage.trim(),
      lu: false,
    })

    if (!error) {
      setNewMessage("")
      await loadMessages()
    }

    setSending(false)
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
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-background)" }}>
      {/* En-tête */}
      <header className="border-b flex-shrink-0" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/messages" className="p-1" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>
            {autreNom.split(" ").map(n => n[0] || "").join("").toUpperCase().slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-semibold">{autreNom}</p>
            {reservation && (
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Leçon du {new Date(reservation.date_heure).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Zone de messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-3">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-3xl mb-3">💬</p>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                Aucun message. Envoyez le premier !
              </p>
            </div>
          )}

          {messages.map(m => {
            const isMine = m.sender_id === userId
            return (
              <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[75%] px-4 py-2.5 rounded-2xl" style={{
                  background: isMine ? "var(--color-primary)" : "var(--color-surface)",
                  color: isMine ? "white" : "var(--color-text)",
                  border: isMine ? "none" : "1px solid var(--color-border)",
                  borderBottomRightRadius: isMine ? 4 : 16,
                  borderBottomLeftRadius: isMine ? 16 : 4,
                }}>
                  <p className="text-sm">{m.contenu}</p>
                  <p className="text-[10px] mt-1" style={{ opacity: 0.6 }}>
                    {new Date(m.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Barre de saisie */}
      <div className="border-t flex-shrink-0" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <input
            type="text"
            placeholder="Votre message…"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && envoyer()}
            className="input-field flex-1"
            style={{ borderRadius: 100, padding: "10px 18px" }}
          />
          <button onClick={envoyer} disabled={sending || !newMessage.trim()}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
            style={{
              background: newMessage.trim() ? "var(--color-primary)" : "var(--color-border)",
              color: "white",
              border: "none",
              cursor: newMessage.trim() ? "pointer" : "default",
            }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
