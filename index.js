import express from "express"
import { createPairCode } from "./pair.js"

const app = express()
const PORT = process.env.PORT || 3000

app.get("/", async (req, res) => {
  const phone = req.query.phone

  if (!phone) {
    return res.send(`
      <h2>NEXTY XMD – Session / Pair Code Generator</h2>
      <form method="GET">
        <input name="phone" placeholder="923xxxxxxxxx" required />
        <button type="submit">Generate Pair Code</button>
      </form>
    `)
  }

  try {
    const code = await createPairCode(phone)
    res.send(`
      <h2>PAIR CODE GENERATED</h2>
      <h1>${code}</h1>
      <p>
        WhatsApp → Settings → Linked Devices → Link a device<br>
        Enter this code
      </p>
      <p><b>Session ID will arrive in Message Yourself</b></p>
    `)
  } catch (err) {
    res.send("❌ Failed to generate pair code")
  }
})

app.listen(PORT, () => {
  console.log("NEXTY XMD Session Generator running on", PORT)
})
