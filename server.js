import express from "express";
import makeWASocket, {
  useMultiFileAuthState
} from "@whiskeysockets/baileys";
import crypto from "crypto";
import fs from "fs";
import pino from "pino";

const app = express();
app.use(express.json());
app.use(express.static("public"));

let sock;

async function startSock() {
  const { state, saveCreds } = await useMultiFileAuthState("session");

  sock = makeWASocket({
    auth: state,
    logger: pino({ level: "silent" }),
    browser: ["NEXTY XMD", "Chrome", "1.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection }) => {
    if (connection === "open") {
      const creds = fs.readFileSync("./session/creds.json");
      const encoded = Buffer.from(creds).toString("base64");

      const random = crypto.randomBytes(8).toString("hex").toUpperCase();
      const sessionId = `NEXTY~${random}`;

      fs.writeFileSync(
        "session-store.json",
        JSON.stringify({ [sessionId]: encoded }, null, 2)
      );

      await sock.sendMessage(sock.user.id, {
        text: `✅ SESSION ID ✅\n\n${sessionId}`
      });

      console.log("SESSION ID GENERATED:", sessionId);
    }
  });
}

startSock();

app.post("/pair", async (req, res) => {
  const { number } = req.body;

  if (!sock || sock.authState.creds.registered)
    return res.json({ error: "Already paired" });

  const code = await sock.requestPairingCode(number);
  res.json({ code });
});

app.listen(process.env.PORT || 3000);
