import makeWASocket, { useMultiFileAuthState } from "@adiwajshing/baileys";

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth");

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false // ❌ QR disabled
  });

  sock.ev.on("creds.update", saveCreds);

  // 👉 Pair code generate (ONLY once)
  if (!sock.authState.creds.registered) {
    const phoneNumber = process.env.PHONE; 
    if (!phoneNumber) {
      console.log("❌ PHONE number missing in config vars");
      return;
    }

    const code = await sock.requestPairingCode(phoneNumber);
    console.log("=================================");
    console.log("✅ WHATSAPP PAIR CODE:", code);
    console.log("📱 WhatsApp > Linked devices > Link with phone number");
    console.log("=================================");
  }

  sock.ev.on("connection.update", (u) => {
    if (u.connection === "open") {
      console.log("🎉 WhatsApp Bot Connected!");
    }
  });
}

startBot();
