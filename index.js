import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from "@whiskeysockets/baileys";
import pino from "pino";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function startSession() {
  const { state, saveCreds } = await useMultiFileAuthState("session");

  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state,
    printQRInTerminal: true,
    browser: ["NEXTY XMD SESSION", "Chrome", "1.0"]
  });

  // Pair code (without QR)
  if (!sock.authState.creds.registered) {
    rl.question("📞 Enter WhatsApp number with country code: ", async (num) => {
      const code = await sock.requestPairingCode(num.trim());
      console.log("\n🔑 PAIR CODE:", code);
      rl.close();
    });
  }

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    if (update.connection === "open") {
      console.log("\n✅ SESSION GENERATED SUCCESSFULLY");
      console.log("📁 session/creds.json READY");
    }

    if (
      update.connection === "close" &&
      update.lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut
    ) {
      startSession();
    }
  });
}

startSession();
