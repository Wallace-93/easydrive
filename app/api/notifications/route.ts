import { NextRequest, NextResponse } from "next/server"

const RESEND_API_KEY = process.env.RESEND_API_KEY || ""
const ADMIN_EMAIL = "fallies.project@gmail.com"

type NotificationType =
  | "reservation_nouvelle"
  | "reservation_confirmee"
  | "reservation_annulee"
  | "message_nouveau"
  | "rappel_lecon"
  | "inscription_moniteur"

const TEMPLATES: Record<NotificationType, { sujet: string; corps: (data: any) => string }> = {
  reservation_nouvelle: {
    sujet: "Nouvelle demande de réservation",
    corps: (d) => `
      <h2 style="color:#00B37D">Nouvelle demande de réservation</h2>
      <p>Bonjour ${d.moniteurPrenom},</p>
      <p><strong>${d.elevePrenom} ${d.eleveNom}</strong> souhaite réserver une leçon de conduite avec vous.</p>
      <p>📅 <strong>${d.date}</strong> à <strong>${d.heure}</strong></p>
      <p>📍 ${d.lieu}</p>
      <p>💰 ${d.montant} €</p>
      <p>Connectez-vous à votre espace Easy Drive pour accepter ou refuser cette demande.</p>
      <a href="https://easydrive.vercel.app/dashboard" style="display:inline-block;padding:12px 24px;background:#00B37D;color:white;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">Voir la demande →</a>
    `,
  },
  reservation_confirmee: {
    sujet: "Votre leçon est confirmée !",
    corps: (d) => `
      <h2 style="color:#00B37D">Leçon confirmée !</h2>
      <p>Bonjour ${d.elevePrenom},</p>
      <p>Bonne nouvelle : <strong>${d.moniteurPrenom} ${d.moniteurNom}</strong> a confirmé votre leçon de conduite.</p>
      <p>📅 <strong>${d.date}</strong> à <strong>${d.heure}</strong></p>
      <p>📍 ${d.lieu}</p>
      <p>💰 ${d.montant} €</p>
      <p>Préparez-vous bien et à bientôt sur la route !</p>
    `,
  },
  reservation_annulee: {
    sujet: "Réservation annulée",
    corps: (d) => `
      <h2 style="color:#EF4444">Réservation annulée</h2>
      <p>Bonjour ${d.prenom},</p>
      <p>La leçon prévue le <strong>${d.date}</strong> à <strong>${d.heure}</strong> a été annulée.</p>
      <p>Vous pouvez réserver un nouveau créneau à tout moment sur Easy Drive.</p>
      <a href="https://easydrive.vercel.app/resultats" style="display:inline-block;padding:12px 24px;background:#00B37D;color:white;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">Trouver un moniteur →</a>
    `,
  },
  message_nouveau: {
    sujet: "Vous avez un nouveau message",
    corps: (d) => `
      <h2 style="color:#00B37D">Nouveau message</h2>
      <p>Bonjour ${d.destinatairePrenom},</p>
      <p><strong>${d.expediteurPrenom}</strong> vous a envoyé un message :</p>
      <blockquote style="padding:12px 16px;background:#F8FAFB;border-left:3px solid #00B37D;border-radius:4px;margin:16px 0;color:#64748B">${d.apercu}</blockquote>
      <a href="https://easydrive.vercel.app/messages/${d.reservationId}" style="display:inline-block;padding:12px 24px;background:#00B37D;color:white;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">Répondre →</a>
    `,
  },
  rappel_lecon: {
    sujet: "Rappel : votre leçon a lieu demain",
    corps: (d) => `
      <h2 style="color:#00B37D">Rappel de leçon</h2>
      <p>Bonjour ${d.prenom},</p>
      <p>Votre leçon de conduite avec <strong>${d.moniteurPrenom}</strong> a lieu <strong>demain</strong>.</p>
      <p>📅 <strong>${d.date}</strong> à <strong>${d.heure}</strong></p>
      <p>📍 ${d.lieu}</p>
      <p>Pensez à être ponctuel et à apporter vos documents. Bonne route !</p>
    `,
  },
  inscription_moniteur: {
    sujet: "[Admin] Nouveau moniteur inscrit",
    corps: (d) => `
      <h2 style="color:#00B37D">Nouveau moniteur inscrit</h2>
      <p><strong>${d.prenom} ${d.nom}</strong> vient de s'inscrire comme moniteur sur Easy Drive.</p>
      <p>📧 ${d.email}</p>
      <p>📞 ${d.telephone}</p>
      <p>🎓 Diplôme : ${d.diplome}</p>
      <p>📍 Zone : ${d.zone}</p>
      ${d.diplomeUrl ? `<p>📎 <a href="${d.diplomeUrl}">Voir le diplôme</a></p>` : '<p>⚠️ Aucun diplôme téléversé</p>'}
      <p>Connectez-vous à Supabase pour vérifier et activer son profil.</p>
    `,
  },
}

export async function POST(req: NextRequest) {
  try {
    const { type, destinataire, data } = await req.json() as {
      type: NotificationType
      destinataire: string
      data: any
    }

    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: "Clé Resend non configurée" }, { status: 500 })
    }

    const template = TEMPLATES[type]
    if (!template) {
      return NextResponse.json({ error: "Type de notification inconnu" }, { status: 400 })
    }

    const html = `
      <div style="max-width:560px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0F172A">
        ${template.corps(data)}
        <hr style="border:none;border-top:1px solid #E2E8F0;margin:32px 0 16px" />
        <p style="font-size:12px;color:#94A3B8">Easy Drive — L'auto-école 2.0 en Île-de-France</p>
      </div>
    `

    const emailTo = type === "inscription_moniteur" ? ADMIN_EMAIL : destinataire

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Easy Drive <onboarding@resend.dev>",
        to: emailTo,
        subject: `Easy Drive — ${template.sujet}`,
        html,
      }),
    })

    if (!res.ok) {
      const errData = await res.json()
      return NextResponse.json({ error: errData }, { status: res.status })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
