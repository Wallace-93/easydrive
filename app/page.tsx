"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import Link from "next/link"

export default function Home() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    createClient().auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })
  }, [])

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>

      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 border-b" style={{ borderColor: "var(--color-border)", background: "rgba(248,250,251,0.9)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-baseline gap-1" style={{ fontFamily: "var(--font-display)" }}>
            <span className="text-xl font-extrabold" style={{ color: "var(--color-primary)" }}>Easy</span>
            <span className="text-xl font-light" style={{ color: "var(--color-text)" }}>Drive</span>
          </div>
          <nav className="hidden sm:flex items-center gap-6">
            <a href="#avantages" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>Avantages</a>
            <a href="#fonctionnement" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>Comment ça marche</a>
            <a href="#moniteurs" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>Moniteurs</a>
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard" className="btn-primary text-sm" style={{ textDecoration: "none", padding: "10px 20px" }}>
                Mon espace →
              </Link>
            ) : (
              <>
                <Link href="/connexion" className="text-sm font-medium hidden sm:block" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>Se connecter</Link>
                <Link href="/inscription" className="btn-primary text-sm" style={{ textDecoration: "none", padding: "10px 20px" }}>
                  Commencer
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-28 sm:pt-36 pb-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-semibold"
            style={{ background: "var(--color-primary-light)", color: "var(--color-primary-dark)" }}>
            🚗 La nouvelle auto-école en Île-de-France
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>
            Choisissez votre moniteur,{" "}
            <span style={{ color: "var(--color-primary)" }}>pas votre auto-école.</span>
          </h1>
          <p className="text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl mx-auto" style={{ color: "var(--color-text-secondary)" }}>
            Easy Drive vous connecte avec des moniteurs indépendants de qualité en Île-de-France. Suivi personnalisé, tarifs justes, code de la route gratuit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/inscription" className="btn-primary text-base px-8 py-4" style={{ textDecoration: "none" }}>
              Créer mon compte gratuitement
            </Link>
            <Link href="/resultats" className="text-base font-semibold px-8 py-4 rounded-xl transition-all"
              style={{ background: "var(--color-surface)", border: "1.5px solid var(--color-border)", color: "var(--color-text)", textDecoration: "none" }}>
              Voir les moniteurs →
            </Link>
          </div>
          <p className="text-xs mt-6" style={{ color: "var(--color-text-muted)" }}>
            Inscription gratuite · Sans engagement · Code de la route inclus
          </p>
        </div>
      </section>

      {/* Chiffres clés */}
      <section className="py-16 px-4 sm:px-6" style={{ background: "var(--color-surface)" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: "15 %", label: "De commission seulement", sub: "Vs 40-50 % chez les concurrents" },
            { value: "35-45 €", label: "Par heure de conduite", sub: "Jusqu'à 30 % moins cher" },
            { value: "100 %", label: "Gratuit pour le code", sub: "Accès illimité aux tests" },
            { value: "24h", label: "Réponse garantie", sub: "Service client réactif" },
          ].map(s => (
            <div key={s.label}>
              <p className="text-3xl sm:text-4xl font-extrabold" style={{ fontFamily: "var(--font-display)", color: "var(--color-primary)" }}>{s.value}</p>
              <p className="text-sm font-semibold mt-2">{s.label}</p>
              <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Avantages */}
      <section id="avantages" className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Pourquoi choisir Easy Drive ?
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: "var(--color-text-secondary)" }}>
              Une approche différente, centrée sur la relation entre l'élève et son moniteur.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "🎯",
                titre: "Le moniteur-coach",
                desc: "Choisissez votre moniteur selon son profil, ses spécialités et les avis des autres élèves. Pas de moniteur imposé.",
              },
              {
                icon: "📊",
                titre: "Suivi pédagogique",
                desc: "Un carnet de bord digital pour suivre votre progression. Visualisez vos compétences acquises après chaque leçon.",
              },
              {
                icon: "💰",
                titre: "Tarifs justes",
                desc: "Nos moniteurs fixent leurs prix. Avec seulement 15 % de commission, ils gagnent plus et vous payez moins.",
              },
              {
                icon: "📍",
                titre: "Île-de-France",
                desc: "Paris et toute la grande couronne : de Cergy à Melun, de Versailles à Meaux. Là où les autres sont absents.",
              },
              {
                icon: "💬",
                titre: "Messagerie directe",
                desc: "Communiquez directement avec votre moniteur. Pas de standard téléphonique, pas de formulaire, un vrai échange.",
              },
              {
                icon: "🎓",
                titre: "Code gratuit",
                desc: "Accédez à des milliers de questions pour préparer votre examen du code de la route, gratuitement.",
              },
            ].map(a => (
              <div key={a.titre} className="rounded-2xl p-6" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                <span className="text-3xl">{a.icon}</span>
                <h3 className="text-base font-bold mt-4 mb-2">{a.titre}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="fonctionnement" className="py-20 px-4 sm:px-6" style={{ background: "var(--color-surface)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Comment ça marche ?
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: "var(--color-text-secondary)" }}>
              Trois étapes simples pour commencer à conduire.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                etape: "1",
                titre: "Créez votre profil",
                desc: "Inscrivez-vous en 2 minutes. Indiquez votre niveau, vos disponibilités et votre zone.",
              },
              {
                etape: "2",
                titre: "Choisissez un moniteur",
                desc: "Parcourez les profils, comparez les spécialités, lisez les avis et choisissez votre coach.",
              },
              {
                etape: "3",
                titre: "Réservez et conduisez",
                desc: "Réservez un créneau, retrouvez votre moniteur au lieu de rendez-vous choisi et prenez le volant.",
              },
            ].map(e => (
              <div key={e.etape} className="text-center">
                <div className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center text-xl font-extrabold"
                  style={{ background: "var(--color-primary)", color: "white", fontFamily: "var(--font-display)" }}>
                  {e.etape}
                </div>
                <h3 className="text-base font-bold mb-2">{e.titre}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Moniteurs */}
      <section id="moniteurs" className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl p-8 sm:p-12 text-center" style={{ background: "var(--color-primary-light)", border: "1px solid rgba(0,179,125,0.2)" }}>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--color-primary-dark)" }}>
              Vous êtes moniteur indépendant ?
            </h2>
            <p className="text-base mb-8 max-w-lg mx-auto" style={{ color: "var(--color-primary-dark)" }}>
              Rejoignez Easy Drive et gardez 85 % de vos revenus. Gérez votre planning, vos élèves et votre activité depuis un seul tableau de bord.
            </p>
            <Link href="/inscription-moniteur" className="inline-block px-8 py-4 rounded-xl text-base font-bold transition-all"
              style={{ background: "var(--color-primary)", color: "white", textDecoration: "none" }}>
              Devenir moniteur Easy Drive →
            </Link>
            <p className="text-xs mt-4" style={{ color: "var(--color-primary)" }}>
              Commission la plus basse du marché : 15 %
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 border-t" style={{ borderColor: "var(--color-border)" }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-baseline gap-1" style={{ fontFamily: "var(--font-display)" }}>
            <span className="text-lg font-extrabold" style={{ color: "var(--color-primary)" }}>Easy</span>
            <span className="text-lg font-light" style={{ color: "var(--color-text)" }}>Drive</span>
          </div>
          <div className="flex items-center gap-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
            <Link href="/resultats" style={{ color: "inherit", textDecoration: "none" }}>Moniteurs</Link>
            <Link href="/inscription" style={{ color: "inherit", textDecoration: "none" }}>S'inscrire</Link>
            <Link href="/inscription-moniteur" style={{ color: "inherit", textDecoration: "none" }}>Devenir moniteur</Link>
            <Link href="/connexion" style={{ color: "inherit", textDecoration: "none" }}>Connexion</Link>
          </div>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            © 2026 Easy Drive. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  )
}
