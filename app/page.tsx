"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import Link from "next/link"
import { BackgroundScene } from "@/components/background-scene"
import { Target, BarChart3, Coins, MapPin, Sparkles, MessageCircle, GraduationCap, Car, Users, Clock, Shield, Zap, ChevronDown } from "lucide-react"

const SLOGANS = [
  { debut: "Choisissez votre moniteur,", accent: "pas votre auto-école." },
  { debut: "Apprenez à conduire,", accent: "pas à patienter." },
  { debut: "Un moniteur qui connaît votre prénom,", accent: "ça change tout." },
  { debut: "Le permis au prix juste,", accent: "pas au prix fort." },
  { debut: "Des conditions éthiques pour nos moniteurs.", accent: "De meilleurs cours pour vous." },
  { debut: "On ne vend pas des packs.", accent: "On trouve votre coach." },
  { debut: "Fini les moniteurs imposés.", accent: "Ici, c'est vous qui choisissez." },
  { debut: "Le permis sans les surprises,", accent: "juste la route." },
  { debut: "Réservez en 30 secondes.", accent: "Sans passer par l'accueil." },
  { debut: "Pas de secrétaire, pas d'attente.", accent: "Juste vous et votre moniteur." },
  { debut: "Un créneau chaque semaine,", accent: "pas chaque trimestre." },
  { debut: "Conduire régulièrement,", accent: "progresser vraiment." },
  { debut: "Des moniteurs vérifiés,", accent: "pas des inconnus au volant." },
  { debut: "Un moniteur qui se présente à l'heure.", accent: "Oui, ça existe." },
  { debut: "Vous choisissez le tarif,", accent: "pas l'auto-école." },
  { debut: "Payez à l'heure, sans engagement.", accent: "Votre budget, vos règles." },
]

function SloganCarousel() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex(prev => (prev + 1) % SLOGANS.length)
        setVisible(true)
      }, 600)
    }, 6500)
    return () => clearInterval(timer)
  }, [])

  return (
    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
      style={{ fontFamily: "var(--font-display)", color: "var(--color-text)", minHeight: "2.6em" }}>
      <span style={{
        transition: "opacity 0.6s ease, transform 0.6s ease",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        display: "inline-block",
      }}>
        {SLOGANS[index].debut}{" "}
        <span style={{ color: "var(--color-primary)" }}>{SLOGANS[index].accent}</span>
      </span>
    </h1>
  )
}

const FAQ_ITEMS = [
  {
    question: "Just Conduite est-il une vraie auto-école ?",
    reponse: "Just Conduite est une plateforme de mise en relation entre des élèves et des moniteurs indépendants diplômés d'État (BEPECASER ou Titre Pro ECSR). Chaque moniteur est vérifié avant d'être activé sur la plateforme. Vous bénéficiez du même cadre légal qu'en auto-école traditionnelle, avec plus de flexibilité et des tarifs plus justes.",
  },
  {
    question: "Pourquoi c'est moins cher qu'une auto-école classique ?",
    reponse: "Une auto-école traditionnelle a des charges importantes : loyer, secrétariat, gestion du parc de véhicules. Ces coûts se répercutent sur le prix de vos leçons. Chez Just Conduite, le moniteur travaille en indépendant et nous ne prélevons que 15 % de commission (contre 40 à 50 % chez nos concurrents en ligne). Le résultat : le moniteur gagne plus, et vous payez moins.",
  },
  {
    question: "Les moniteurs sont-ils vraiment qualifiés ?",
    reponse: "Absolument. Chaque moniteur doit fournir son diplôme (BEPECASER ou Titre Pro ECSR) lors de son inscription. Notre équipe vérifie chaque document avant d'activer le profil. De plus, les avis laissés par les élèves après chaque leçon garantissent un niveau de qualité constant.",
  },
  {
    question: "Le code de la route est vraiment gratuit ?",
    reponse: "Oui, l'accès à notre entraînement au code de la route est entièrement gratuit, sans limite de temps ni de tentatives. Vous avez accès à des dizaines de questions réparties en 10 thèmes officiels, des examens blancs et un suivi de votre progression. Pas besoin de créer un compte pour commencer.",
  },
  {
    question: "Que se passe-t-il si je ne suis pas satisfait de mon moniteur ?",
    reponse: "Vous n'avez aucun engagement. Vous pouvez changer de moniteur à tout moment, sans frais et sans justification. C'est l'un des avantages majeurs de Just Conduite par rapport aux auto-écoles traditionnelles où vous êtes lié à un seul établissement.",
  },
  {
    question: "Comment se passe la réservation ?",
    reponse: "Vous choisissez votre moniteur, sélectionnez une date, un créneau horaire et un lieu de rendez-vous. Le moniteur reçoit votre demande et la confirme sous 24 heures. Vous pouvez réserver des leçons de 1 ou 2 heures, jusqu'à 22 heures le soir.",
  },
  {
    question: "Qui fournit le véhicule pour les leçons ?",
    reponse: "Le moniteur dispose de son propre véhicule à double commande, équipé pour l'enseignement de la conduite. Certains moniteurs proposent également la location de leur véhicule à d'autres enseignants via notre marketplace dédiée.",
  },
  {
    question: "Comment Just Conduite se compare à Ornikar ou En Voiture Simone ?",
    reponse: "La différence principale est la commission. Ornikar et En Voiture Simone prélèvent 40 à 50 % sur chaque heure de leçon, ce qui oblige les moniteurs à augmenter leurs tarifs. Chez Just Conduite, la commission est de 15 %. Résultat : les moniteurs sont mieux rémunérés, plus motivés, et vos leçons coûtent moins cher. De plus, nous nous concentrons sur l'Île-de-France, y compris la grande couronne souvent délaissée par les plateformes nationales.",
  },
  {
    question: "Puis-je passer l'examen avec Just Conduite ?",
    reponse: "Votre moniteur vous prépare à l'examen et vous accompagne dans les démarches. L'inscription à l'examen du permis se fait sur le site de l'ANTS (Agence Nationale des Titres Sécurisés). Votre moniteur peut vous guider dans cette procédure si besoin.",
  },
  {
    question: "Quels moyens de paiement acceptez-vous ?",
    reponse: "Le paiement se fait directement entre vous et votre moniteur. Nous travaillons actuellement à l'intégration d'un système de paiement en ligne sécurisé pour simplifier les transactions. Les demandeurs d'emploi peuvent utiliser leur CPF pour financer leur formation.",
  },
]

function FaqAccordion() {
  const [ouvert, setOuvert] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-2">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className="rounded-xl overflow-hidden" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
          <button
            onClick={() => setOuvert(ouvert === i ? null : i)}
            className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>{item.question}</span>
            <ChevronDown
              size={18}
              style={{
                color: "var(--color-text-muted)",
                flexShrink: 0,
                transition: "transform 0.3s ease",
                transform: ouvert === i ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>
          <div style={{
            maxHeight: ouvert === i ? "500px" : "0px",
            overflow: "hidden",
            transition: "max-height 0.3s ease, padding 0.3s ease",
          }}>
            <p className="text-sm leading-relaxed px-5 pb-4" style={{ color: "var(--color-text-secondary)" }}>
              {item.reponse}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}


export default function Home() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    createClient().auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })
  }, [])

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)", position: "relative" }}>

      <BackgroundScene />

      {/* Navigation */}
      <header style={{ position: "relative", zIndex: 10 }} className="fixed top-0 w-full z-50 border-b" style={{ borderColor: "var(--color-border)", background: "rgba(248,250,251,0.9)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-baseline gap-1" style={{ fontFamily: "var(--font-display)" }}>
            <span className="text-xl font-extrabold" style={{ color: "var(--color-primary)" }}>Just</span>
            <span className="text-xl font-light" style={{ color: "var(--color-text)" }}>Conduite</span>
          </div>
          <nav className="hidden sm:flex items-center gap-6">
            <a href="#avantages" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>Avantages</a>
            <a href="#fonctionnement" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>Comment ça marche</a>
            <a href="#moniteurs" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>Moniteurs</a>
            <Link href="/code" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>Code gratuit</Link>
            <a href="#faq" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>FAQ</a>
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
      <section style={{ position: "relative", zIndex: 1 }} className="pt-28 sm:pt-36 pb-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-semibold"
            style={{ background: "var(--color-primary-light)", color: "var(--color-primary-dark)" }}>
            La nouvelle auto-école en Île-de-France
          </div>
          <SloganCarousel />
          <p className="text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl mx-auto" style={{ color: "var(--color-text-secondary)" }}>
            Just Conduite vous connecte avec des moniteurs indépendants de qualité en Île-de-France. Suivi personnalisé, tarifs justes, code de la route gratuit.
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
      <section style={{ position: "relative", zIndex: 1 }} className="py-16 px-4 sm:px-6" style={{ background: "var(--color-surface)" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { value: "15 %", label: "De commission seulement", sub: "Vs 40-50 % chez les concurrents" },
            { value: "35-45 €", label: "Par heure de conduite (en moyenne)", sub: "Les moniteurs fixent librement leurs tarifs" },
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
      <section id="avantages" style={{ position: "relative", zIndex: 1 }} className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Pourquoi choisir Just Conduite ?
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: "var(--color-text-secondary)" }}>
              Une approche différente, centrée sur la relation entre l'élève et son moniteur.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Target size={24} />,
                titre: "Le moniteur-coach",
                desc: "Choisissez votre moniteur selon son profil, ses spécialités et les avis des autres élèves. Pas de moniteur imposé.",
              },
              {
                icon: <BarChart3 size={24} />,
                titre: "Suivi pédagogique",
                desc: "Un carnet de bord digital pour suivre votre progression. Visualisez vos compétences acquises après chaque leçon.",
              },
              {
                icon: <Coins size={24} />,
                titre: "Tarifs justes",
                desc: "Nos moniteurs fixent leurs prix. Avec seulement 15 % de commission, ils gagnent plus et vous payez moins.",
              },
              {
                icon: <MapPin size={24} />,
                titre: "Île-de-France",
                desc: "Paris et toute la grande couronne : de Cergy à Melun, de Versailles à Meaux. Là où les autres sont absents.",
              },
              {
                icon: <Sparkles size={24} />,
                titre: "Matching intelligent",
                desc: "Notre algorithme analyse vos besoins, vos disponibilités et les avis des élèves pour vous recommander les 3 moniteurs les plus adaptés.",
              },
              {
                icon: <MessageCircle size={24} />,
                titre: "Messagerie directe",
                desc: "Communiquez directement avec votre moniteur. Pas de standard téléphonique, pas de formulaire, un vrai échange.",
              },
              {
                icon: <GraduationCap size={24} />,
                titre: "Code gratuit",
                desc: "Accédez à des milliers de questions pour préparer votre examen du code de la route, gratuitement.",
              },
            ].map(a => (
              <div key={a.titre} className="rounded-2xl p-6" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>{a.icon}</div>
                <h3 className="text-base font-bold mt-4 mb-2">{a.titre}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="fonctionnement" style={{ position: "relative", zIndex: 1 }} className="py-20 px-4 sm:px-6" style={{ background: "var(--color-surface)" }}>
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


      {/* FAQ */}
      <section id="faq" style={{ position: "relative", zIndex: 1 }} className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Questions fréquentes
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: "var(--color-text-secondary)" }}>
              Tout ce que vous devez savoir avant de commencer.
            </p>
          </div>

          <FaqAccordion />
        </div>
      </section>

      {/* CTA Moniteurs */}
      <section id="moniteurs" style={{ position: "relative", zIndex: 1 }} className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl p-8 sm:p-12 text-center" style={{ background: "var(--color-primary-light)", border: "1px solid rgba(0,179,125,0.2)" }}>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-4" style={{ fontFamily: "var(--font-display)", color: "var(--color-primary-dark)" }}>
              Vous êtes moniteur indépendant ?
            </h2>
            <p className="text-base mb-8 max-w-lg mx-auto" style={{ color: "var(--color-primary-dark)" }}>
              Rejoignez Just Conduite et gardez 85 % de vos revenus. Gérez votre planning, vos élèves et votre activité depuis un seul tableau de bord.
            </p>
            <Link href="/inscription-moniteur" className="inline-block px-8 py-4 rounded-xl text-base font-bold transition-all"
              style={{ background: "var(--color-primary)", color: "white", textDecoration: "none" }}>
              Devenir moniteur Just Conduite →
            </Link>
            <p className="text-xs mt-4" style={{ color: "var(--color-primary)" }}>
              Commission la plus basse du marché : 15 %
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 1 }} className="py-12 px-4 sm:px-6 border-t" style={{ borderColor: "var(--color-border)" }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-baseline gap-1" style={{ fontFamily: "var(--font-display)" }}>
            <span className="text-lg font-extrabold" style={{ color: "var(--color-primary)" }}>Just</span>
            <span className="text-lg font-light" style={{ color: "var(--color-text)" }}>Conduite</span>
          </div>
          <div className="flex items-center gap-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
            <Link href="/resultats" style={{ color: "inherit", textDecoration: "none" }}>Moniteurs</Link>
            <Link href="/inscription" style={{ color: "inherit", textDecoration: "none" }}>S'inscrire</Link>
            <Link href="/inscription-moniteur" style={{ color: "inherit", textDecoration: "none" }}>Devenir moniteur</Link>
            <Link href="/code" style={{ color: "inherit", textDecoration: "none" }}>Code gratuit</Link>
            <Link href="/connexion" style={{ color: "inherit", textDecoration: "none" }}>Connexion</Link>
          </div>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            © 2026 Just Conduite. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  )
}
