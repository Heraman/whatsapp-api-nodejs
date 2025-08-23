const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()
const PORT = 3000

// Middleware
app.use(cors())
app.use(bodyParser.json())

// Data tiket dummy
let tickets = [
  { qr_code: 'TICKET-123', used: false },
  { qr_code: 'TICKET-456', used: false },
  { qr_code: 'TICKET-789', used: false }
]

// Endpoint scan-ticket
app.post('/scan-ticket', (req, res) => {
  const { qr_result } = req.body

  if (!qr_result) {
    return res.status(400).json({ valid: false, message: 'QR code tidak dikirim' })
  }

  const ticket = tickets.find(t => t.qr_code === qr_result)

  if (!ticket) {
    return res.json({ valid: false, message: 'Tiket tidak ditemukan' })
  }

  if (ticket.used) {
    return res.json({ valid: false, message: 'Tiket sudah digunakan' })
  }

  // Tandai tiket sudah dipakai
  ticket.used = true

  return res.json({ valid: true, message: 'Tiket valid dan berhasil digunakan' })
})

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
