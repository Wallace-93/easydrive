"use client"

import { useState } from "react"
import Link from "next/link"

const ARTICLES = [
  {
    id: "1",
    categorie: "Examen",
    titre: "7 erreurs qui font échouer à l'examen de conduite",
    resume: "Découvrez les erreurs éliminatoires les plus courantes et comment les éviter le jour J.",
    contenu: `L'examen du permis de conduire est un moment stressant pour la plupart des candidats. Connaître les erreurs les plus fréquentes permet de mieux s'y préparer.

**1. Oublier les contrôles visuels**
Avant chaque manœuvre (démarrage, changement de direction, dépassement), les contrôles dans les rétroviseurs ET par-dessus l'épaule sont obligatoires. L'inspecteur y est particulièrement attentif.

**2. Ne pas respecter les priorités**
Griller un stop, ignorer un cédez-le-passage ou ne pas céder la priorité à droite sont des fautes éliminatoires.

**3. Vitesse inadaptée**
Rouler trop vite OU trop lentement. Les deux sont pénalisés. Adaptez votre vitesse aux conditions.

**4. Mauvais placement sur la chaussée**
Rouler trop à gauche, mordre la ligne continue ou mal se positionner dans un rond-point.

**5. Oublier la ceinture de sécurité**
Cela semble évident, mais le stress fait parfois oublier les gestes simples.

**6. Caler plusieurs fois**
Un calage peut arriver, mais caler 3 ou 4 fois montre un manque de maîtrise du véhicule.

**7. Ne pas s'adapter aux autres usagers**
Ne pas ralentir à l'approche d'un piéton, coller un cycliste ou ignorer les véhicules prioritaires.`,
    icone: "🎯",
    tempsLecture: "4 min",
  },
  {
    id: "2",
    categorie: "Formation",
    titre: "La régularité : le secret d'un apprentissage efficace",
    resume: "Pourquoi espacer ses leçons est le piège numéro un des candidats au permis.",
    contenu: `La régularité est le facteur le plus sous-estimé dans l'apprentissage de la conduite. Voici pourquoi elle fait toute la différence.

**Le piège des leçons espacées**
Prendre une leçon toutes les 3 semaines, c'est oublier la moitié de ce que vous avez appris à la séance précédente. Votre moniteur passe alors du temps à vous faire réviser au lieu de vous faire progresser. Résultat : vous multipliez les heures et la facture explose.

**Le rythme idéal**
Pour progresser efficacement, visez au minimum une leçon par semaine. L'idéal est de 2 leçons par semaine, espacées de 2 ou 3 jours. Ce rythme permet de consolider vos acquis sans saturer.

**Même logique pour le code**
Révisez le code 20 à 30 minutes par jour plutôt que 3 heures une fois par semaine. La répétition régulière ancre les connaissances dans la mémoire à long terme. Les candidats qui révisent quotidiennement obtiennent en moyenne 5 points de plus à l'examen.

**Ne laissez pas la motivation retomber**
Plus vous espacez vos séances, plus vous risquez de décrocher. La conduite devient une corvée au lieu d'un plaisir. À l'inverse, un rythme soutenu crée une dynamique positive : vous sentez que vous progressez et cela vous motive à continuer.

**Fixez-vous une date d'examen**
Avoir une échéance claire vous oblige à maintenir le rythme. Sans objectif de date, la formation s'étire indéfiniment. Discutez avec votre moniteur pour définir un planning réaliste.

**Conseil pratique**
Réservez vos 4 prochaines leçons d'un coup. Bloquez les créneaux dans votre agenda comme vous le feriez pour un rendez-vous médical. La régularité n'est pas une question de motivation, c'est une question d'organisation.`,
    icone: "📅",
    tempsLecture: "3 min",
  },
  {
    id: "3",
    categorie: "Bien-être",
    titre: "Gérer le stress au volant : 5 techniques qui fonctionnent",
    resume: "Le stress est le premier ennemi du conducteur débutant. Voici comment le maîtriser.",
    contenu: `Le stress au volant est normal, surtout au début. L'important est d'apprendre à le gérer.

**1. La respiration abdominale**
Avant de démarrer, prenez 3 grandes inspirations par le nez en gonflant le ventre, puis expirez lentement par la bouche. Répétez à chaque feu rouge si besoin.

**2. La préparation mentale**
Avant chaque leçon, visualisez-vous en train de conduire calmement. Imaginez les situations que vous allez rencontrer et comment vous allez les gérer.

**3. Le dialogue intérieur positif**
Remplacez "je vais faire une erreur" par "je suis en train d'apprendre, chaque leçon me fait progresser". Les mots que vous vous dites influencent directement votre état.

**4. La technique des petites victoires**
Fixez-vous un objectif simple pour chaque leçon : "aujourd'hui, je maîtrise le rond-point". Célébrez chaque progrès, même minime.

**5. Communiquer avec votre moniteur**
Un bon moniteur s'adapte à votre niveau de stress. Dites-lui quand vous vous sentez dépassé. Il est là pour vous accompagner, pas pour vous juger.`,
    icone: "🧘",
    tempsLecture: "3 min",
  },
  {
    id: "4",
    categorie: "Économie",
    titre: "Permis de conduire : comment réduire la facture",
    resume: "Toutes les astuces pour payer moins cher sans sacrifier la qualité de votre formation.",
    contenu: `Le permis de conduire coûte en moyenne 1 800 € en auto-école traditionnelle. Voici comment faire baisser la note.

**Passez le code en candidat libre**
Les plateformes en ligne proposent des formules à partir de 0 € (Just Conduite) contre 200-350 € en auto-école. L'inscription à l'examen coûte 30 € sur l'ANTS.

**Comparez les tarifs des moniteurs**
Sur Just Conduite, les moniteurs fixent leurs propres prix. Les tarifs varient de 35 à 50 €/h selon l'expérience et la zone. Comparez avant de choisir.

**Optimisez votre nombre d'heures**
Le minimum légal est de 20 heures, mais la moyenne nationale est de 35 heures. Plus vous révisez le code et vous entraînez mentalement entre les leçons, moins vous aurez besoin d'heures.

**Le CPF (Compte Personnel de Formation)**
Votre permis B peut être financé par le CPF si vous êtes en recherche d'emploi. Attention : depuis 2024, les salariés ne peuvent plus utiliser le CPF pour financer leur formation automobile. Renseignez-vous sur moncompteformation.gouv.fr.

**La conduite accompagnée (AAC)**
Accessible dès 15 ans, l'AAC permet de conduire 3 000 km avec un accompagnant. Résultat : moins d'heures payantes et un meilleur taux de réussite à l'examen.

**Aide de 500 € pour les apprentis**
Si vous êtes apprenti, vous pouvez bénéficier d'une aide de 500 € pour le financement du permis.`,
    icone: "💰",
    tempsLecture: "4 min",
  },
  {
    id: "5",
    categorie: "Sécurité",
    titre: "Conduire sous la pluie : les bons réflexes",
    resume: "Pluie, brouillard, verglas : adaptez votre conduite aux conditions météo.",
    contenu: `La pluie est responsable de 25 % des accidents de la route. Voici les réflexes à adopter.

**Réduisez votre vitesse**
Sur chaussée mouillée, la distance de freinage est multipliée par 2. Réduisez votre vitesse d'au moins 20 km/h par rapport aux limites habituelles.

**Augmentez les distances de sécurité**
Passez de 2 secondes à 4 secondes derrière le véhicule qui vous précède.

**Allumez vos feux de croisement**
Même en plein jour, les feux de croisement améliorent votre visibilité et celle des autres usagers.

**Attention à l'aquaplanage**
Si vous sentez que le volant devient léger et que la voiture ne répond plus, ne freinez surtout pas. Levez le pied de l'accélérateur et maintenez le volant droit jusqu'à retrouver l'adhérence.

**Les premières minutes de pluie sont les plus dangereuses**
L'eau se mélange à la poussière et à l'huile sur la route, créant une pellicule très glissante. Soyez particulièrement vigilant au début de l'averse.

**Vérifiez vos essuie-glaces**
Des essuie-glaces usés réduisent considérablement votre visibilité. Remplacez-les dès qu'ils laissent des traces.`,
    icone: "🌧️",
    tempsLecture: "3 min",
  },
]

export default function Conseils() {
  const [articleOuvert, setArticleOuvert] = useState<string | null>(null)

  const article = ARTICLES.find(a => a.id === articleOuvert)

  if (article) {
    return (
      <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
        <header className="border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-baseline gap-1" style={{ fontFamily: "var(--font-display)", textDecoration: "none" }}>
              <span className="text-xl font-extrabold" style={{ color: "var(--color-primary)" }}>Just</span>
              <span className="text-xl font-light" style={{ color: "var(--color-text)" }}>Conduite</span>
            </Link>
            <button onClick={() => setArticleOuvert(null)} className="text-sm font-medium"
              style={{ color: "var(--color-text-secondary)", background: "none", border: "none", cursor: "pointer" }}>
              ← Tous les conseils
            </button>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 text-xs font-semibold"
            style={{ background: "var(--color-primary-light)", color: "var(--color-primary-dark)" }}>
            {article.icone} {article.categorie} · {article.tempsLecture} de lecture
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-8" style={{ fontFamily: "var(--font-display)" }}>{article.titre}</h1>

          <div className="rounded-2xl p-6 sm:p-8" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
            {article.contenu.split("\n\n").map((paragraphe, i) => {
              if (paragraphe.startsWith("**") && paragraphe.includes("**\n")) {
                const [titre, ...reste] = paragraphe.split("\n")
                return (
                  <div key={i} className="mb-5">
                    <h3 className="text-base font-bold mb-1">{titre.replace(/\*\*/g, "")}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{reste.join(" ")}</p>
                  </div>
                )
              }
              if (paragraphe.startsWith("**")) {
                return <h3 key={i} className="text-base font-bold mt-6 mb-2">{paragraphe.replace(/\*\*/g, "")}</h3>
              }
              return <p key={i} className="text-sm leading-relaxed mb-4" style={{ color: "var(--color-text-secondary)" }}>{paragraphe}</p>
            })}
          </div>

          <div className="mt-8 text-center">
            <Link href="/code" className="btn-primary inline-block" style={{ textDecoration: "none" }}>
              S'entraîner au code →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      <header className="border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-1" style={{ fontFamily: "var(--font-display)", textDecoration: "none" }}>
            <span className="text-xl font-extrabold" style={{ color: "var(--color-primary)" }}>Just</span>
            <span className="text-xl font-light" style={{ color: "var(--color-text)" }}>Conduite</span>
          </Link>
          <Link href="/dashboard" className="text-sm font-medium" style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>← Tableau de bord</Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-3" style={{ fontFamily: "var(--font-display)" }}>
            Conseils et astuces
          </h1>
          <p className="text-sm max-w-lg mx-auto" style={{ color: "var(--color-text-secondary)" }}>
            Des articles pratiques rédigés par des moniteurs pour vous aider à réussir votre permis.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {ARTICLES.map(a => (
            <button key={a.id} onClick={() => setArticleOuvert(a.id)}
              className="rounded-2xl p-5 text-left transition-all"
              style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", cursor: "pointer" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--color-primary)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,179,125,0.1)" }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.boxShadow = "none" }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{a.icone}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: "var(--color-primary-light)", color: "var(--color-primary-dark)" }}>
                      {a.categorie}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>{a.tempsLecture}</span>
                  </div>
                  <h3 className="text-sm font-bold mb-1">{a.titre}</h3>
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{a.resume}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
