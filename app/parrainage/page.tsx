"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import Link from "next/link"
import { Gift, Copy, Check, Users, Coins, Share2, ChevronDown } from "lucide-react"

type Filleul = {
  id: string
  prenom: string
  nom: string
  niveau: number
  statut: "inscrit" | "actif" | "credite"
  montant: number
  created_at: string
}

export default function Parrainage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [codeParrain, setCodeParrain] = useState("")
  const [copied, setCopied] = useState(false)
  const [filleuls, setFilleuls] = useState<Filleul[]>([])
  const [gainTotal, setGainTotal] = useState(0)
  const [gainEnAttente, setGainEnAttente] = useState(0)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        window.location.replace("/connexion")
        return
      }

      setUser(session.user)

      // Générer le code parrain à partir de l'ID utilisateur
      const code = session.user.id.substring(0, 8).toUpperCase()
      setCodeParrain(code)

      // Charger les filleuls
      const { data: parrainages } = await supabase
        .from("parrainages")
        .select("*, filleul:filleul_id (id, profiles:id (prenom, nom))")
        .eq("parrain_id", session.user.id)
        .order("created_at", { ascending: false })

      if (parrainages) {
        const liste: Filleul[] = parrainages.map((p: any) => ({
          id: p.id,
          prenom: p.filleul?.profiles?.prenom || "Utilisateur",
          nom: p.filleul?.profiles?.nom || "",
          niveau: p.niveau,
          statut: p.statut,
          montant: p.montant,
          created_at: p.created_at,
        }))
        setFilleuls(liste)
        setGainTotal(liste.filter(f => f.statut === "credite").reduce((s, f) => s + f.montant, 0))
        setGainEnAttente(liste.filter(f => f.statut !== "credite").reduce((s, f) => s + f.montant, 0))
      }

      setLoading(false)
    }
    load()
  }, [])

  async function copierCode() {
    const lien = `https://justconduite.com/inscription?parrain=${codeParrain}`
    try {
      await navigator.clipboard.writeText(lien)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const input = document.createElement("input")
      input.value = lien
      document.body.appendChild(input)
      input.select()
      document.execCommand("copy")
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  async function partager() {
    const lien = `https://justconduite.com/inscription?parrain=${codeParrain}`
    const texte = `Rejoins Just Conduite pour apprendre à conduire avec un moniteur qui te correspond ! Utilise mon lien pour t'inscrire : ${lien}`
    if (navigator.share) {
      try {
        await navigator.share({ title: "Just Conduite — Parrainage", text: texte, url: lien })
      } catch {}
    } else {
      copierCode()
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

  const STATUT_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    inscrit: { label: "Inscrit", color: "#F59E0B", bg: "#FFFBEB" },
    actif: { label: "1ère leçon effectuée", color: "#00B37D", bg: "#E6F9F1" },
    credite: { label: "Crédité", color: "#00B37D", bg: "#E6F9F1" },
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      <header className="border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-1" style={{ fontFamily: "var(--font-display)", textDecoration: "none" }}>
            <span className="text-xl font-extrabold" style={{ color: "var(--color-primary)" }}>Just</span>
            <span className="text-xl font-light" style={{ color: "var(--color-text)" }}>Conduite</span>
          </Link>
          <Link href="/dashboard" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>← Tableau de bord</Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "linear-gradient(135deg, var(--color-primary), #009966)" }}>
            <Gift size={28} style={{ color: "white" }} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Parrainez, gagnez
          </h1>
          <p className="text-sm max-w-md mx-auto" style={{ color: "var(--color-text-secondary)" }}>
            Invitez vos proches à rejoindre Just Conduite. Vous gagnez <strong style={{ color: "var(--color-primary)" }}>15 €</strong> pour chaque filleul qui effectue sa première leçon, et <strong style={{ color: "var(--color-primary)" }}>5 €</strong> pour chaque filleul de vos filleuls.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl p-4 text-center" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <Users size={20} style={{ color: "var(--color-primary)", margin: "0 auto 8px" }} />
            <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{filleuls.length}</p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Filleuls</p>
          </div>
          <div className="rounded-2xl p-4 text-center" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <Coins size={20} style={{ color: "var(--color-primary)", margin: "0 auto 8px" }} />
            <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--color-primary)" }}>{gainTotal} €</p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Gains crédités</p>
          </div>
          <div className="rounded-2xl p-4 text-center" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            <Coins size={20} style={{ color: "#F59E0B", margin: "0 auto 8px" }} />
            <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: "#F59E0B" }}>{gainEnAttente} €</p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>En attente</p>
          </div>
        </div>

        {/* Code de parrainage */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: "var(--color-primary-light)", border: "1px solid rgba(0,179,125,0.2)" }}>
          <p className="text-sm font-bold mb-3" style={{ color: "var(--color-primary-dark)" }}>Votre code parrain</p>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 rounded-xl px-5 py-3.5 text-center" style={{ background: "white", border: "1.5px dashed var(--color-primary)" }}>
              <span className="text-xl font-extrabold tracking-widest" style={{ fontFamily: "var(--font-display)", color: "var(--color-primary)" }}>
                {codeParrain}
              </span>
            </div>
            <button onClick={copierCode} className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
              style={{ background: "var(--color-primary)", color: "white", border: "none", cursor: "pointer" }}>
              {copied ? <Check size={20} /> : <Copy size={20} />}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button onClick={copierCode} className="flex-1 text-sm font-semibold px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
              style={{ background: "white", color: "var(--color-primary-dark)", border: "none", cursor: "pointer" }}>
              <Copy size={16} /> {copied ? "Lien copié !" : "Copier le lien"}
            </button>
            <button onClick={partager} className="flex-1 text-sm font-semibold px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
              style={{ background: "var(--color-primary)", color: "white", border: "none", cursor: "pointer" }}>
              <Share2 size={16} /> Partager
            </button>
          </div>
        </div>

        {/* Comment ça marche */}
        <div className="rounded-2xl p-6 mb-8" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <p className="text-sm font-bold mb-4">Comment ça marche</p>
          <div className="flex flex-col gap-4">
            {[
              { etape: "1", titre: "Partagez votre lien", desc: "Envoyez votre lien de parrainage à vos proches par SMS, WhatsApp ou réseaux sociaux." },
              { etape: "2", titre: "Votre filleul s'inscrit", desc: "Il crée son compte gratuit via votre lien. Votre code est automatiquement associé." },
              { etape: "3", titre: "Il effectue sa 1ère leçon", desc: "Dès que votre filleul termine sa première leçon de conduite, vous gagnez 15 €." },
              { etape: "4", titre: "Bonus cascade", desc: "Si votre filleul parraine quelqu'un qui fait une leçon, vous gagnez 5 € en plus." },
            ].map(e => (
              <div key={e.etape} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                  style={{ background: "var(--color-primary)", color: "white" }}>
                  {e.etape}
                </div>
                <div>
                  <p className="text-sm font-semibold">{e.titre}</p>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Liste des filleuls */}
        <div>
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Mes filleuls
            {filleuls.length > 0 && <span className="text-sm font-normal ml-2" style={{ color: "var(--color-text-muted)" }}>({filleuls.length})</span>}
          </h2>

          {filleuls.length === 0 ? (
            <div className="rounded-2xl p-8 text-center" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
              <Users size={32} style={{ color: "var(--color-text-muted)", margin: "0 auto 12px" }} />
              <p className="text-sm font-semibold mb-1">Aucun filleul pour le moment</p>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Partagez votre code pour commencer à gagner.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filleuls.map(f => {
                const statut = STATUT_LABELS[f.statut] || STATUT_LABELS.inscrit
                return (
                  <div key={f.id} className="rounded-xl p-4 flex items-center justify-between"
                    style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>
                        {f.prenom[0]}{f.nom[0] || ""}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{f.prenom} {f.nom}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: statut.bg, color: statut.color }}>
                            {statut.label}
                          </span>
                          {f.niveau === 2 && (
                            <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>Niveau 2</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-bold" style={{ color: f.statut === "credite" ? "var(--color-primary)" : "var(--color-text-muted)" }}>
                      {f.montant} €
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
