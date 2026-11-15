import { config } from "./config.js"

export async function handleCommand(sock, m) {
  const from = m.key.remoteJid
  const body = m.message?.conversation || m.message?.extendedTextMessage?.text || m.message?.imageMessage?.caption || ""
  if (!body.startsWith(config.prefix)) return

  const args = body.slice(config.prefix.length).trim().split(/ +/)
  const cmd = args.shift().toLowerCase()
  const text = args.join(" ")

  const reply = (txt) => sock.sendMessage(from, { text: txt }, { quoted: m })

  if (cmd === "menu" || cmd === "help") {
    return reply(`*${config.botName} - MENU*
Owner: ${config.ownerName}
Prefix: ${config.prefix}
Version: ${config.version}

*GENERAL*
${config.prefix}menu - Show menu
${config.prefix}ping - Check speed
${config.prefix}owner - Owner info
${config.prefix}alive - Bot alive?

*FUN*
${config.prefix}joke - Random joke
${config.prefix}quote - Random quote

*TOOLS*
${config.prefix}sticker - Reply to image to make sticker
${config.prefix}ai <text> - Ask AI

Type ${config.prefix}menu to see this again`)
  }

  if (cmd === "ping") {
    const start = Date.now()
    await reply("Pong!")
    return reply(`Speed: ${Date.now() - start}ms`)
  }

  if (cmd === "alive") {
    return reply(`✅ ${config.botName} is ALIVE!\nOwner: ${config.ownerName}\nMode: ${config.mode}`)
  }

  if (cmd === "owner") {
    return reply(`Owner: ${config.ownerName}\nNumber: wa.me/${config.ownerNumber}`)
  }

  if (cmd === "joke") {
    const jokes = [
      "Why did the chicken cross the road? To get to the other side!",
      "Why don't skeletons fight? They don't have the guts!",
      "What do you call a fake noodle? An impasta!"
    ]
    return reply(jokes[Math.floor(Math.random() * jokes.length)])
  }

  if (cmd === "quote") {
    return reply("“Success is not final, failure is not fatal: it is the courage to continue that counts.” - Winston Churchill")
  }

  if (cmd === "ai") {
    if (!text) return reply(`Use: ${config.prefix}ai what is love?`)
    return reply(`🤖 *ZAKHEED AI*\n\nYou asked: ${text}\n\nAI is coming soon in v2! For now try ${config.prefix}menu`)
  }

  if (cmd === "sticker") {
    return reply("Send an image with caption .sticker to make a sticker. Feature coming in v2!")
  }
      }
