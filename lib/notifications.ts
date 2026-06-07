export async function envoyerNotification(
  type: string,
  destinataire: string,
  data: Record<string, any>
) {
  try {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, destinataire, data }),
    })
  } catch {
    // Notification silencieuse — ne bloque pas le flux principal
  }
}
