import makeWASocket, { useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys"
import pino from "pino"
import { config } from "./config.js"
import { handleCommand } from "./commands.js"

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState("session")
  const sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false
  })

  if (!sock.authState.creds.registered) {
    const number = "254796854009"
    const code = await sock.requestPairingCode(number)
    console.log("YOUR PAIRING CODE:", code)
  }

  sock.ev.on("creds.update", saveCreds)
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0]
    if (!m.message || m.key.fromMe) return
    await handleCommand(sock, m)
  })

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      if (shouldReconnect) start()
    } else if (connection === "open") {
      console.log(config.botName + " is ONLINE")
    }
  })
}
start()
