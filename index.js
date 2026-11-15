import makeWASocket, { useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys"
import pino from "pino"
import { config } from "./config.js"
import { handleCommand } from "./commands.js"

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState("session")
  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    browser: ["Ubuntu", "Chrome", "20.0.04"],
    syncFullHistory: false
  })

  sock.ev.on("creds.update", saveCreds)

  // Wait for connection then request pairing code
  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      console.log(config.botName + " is ONLINE")
    }
    if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      console.log("Connection closed, reconnecting:", shouldReconnect)
      if (shouldReconnect) start()
    }
  })

  if (!sock.authState.creds.registered) {
    // Wait 3 seconds for socket to connect first
    await new Promise(r => setTimeout(r, 3000))
    try {
      const number = "254796854009"
      const code = await sock.requestPairingCode(number)
      console.log("YOUR PAIRING CODE:", code)
    } catch (e) {
      console.log("Pairing failed, retrying in 5s...", e.message)
      await new Promise(r => setTimeout(r, 5000))
      start()
    }
  }

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0]
    if (!m.message || m.key.fromMe) return
    await handleCommand(sock, m)
  })
}
start()
