import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} from "@whiskeysockets/baileys"
import Pino from "pino"

export async function createPairCode(phone) {
  const { state, saveCreds } = await useMultiFileAuthState("./auth")
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
    logger: Pino({ level: "silent" }),
    printQRInTerminal: false
  })

  // save session (creds)
  sock.ev.on("creds.update", saveCreds)

  // WAIT until socket is ready
  await new Promise(resolve => {
    sock.ev.on("connection.update", (u) => {
      if (u.connection === "open") resolve()
    })
  })

  // 🔥 THIS LINE SENDS LINK DEVICE REQUEST
  const code = await sock.requestPairingCode(phone)

  return code
}
