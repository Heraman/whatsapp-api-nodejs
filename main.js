(async () => {
    const { makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers} = require('baileys')
    const qrcode = require('qrcode-terminal');
    
    let sock = null;

    async function Start() {
        const { state, saveCreds } = await useMultiFileAuthState('session');

        const conn = makeWASocket({
            auth: state,
            browser: Browsers.windows('Jilpa Dev'),
            syncFullHistory: true
        });

        conn.ev.on('creds.update', saveCreds);

        conn.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {

            if(qr) {
                const qrstr = qrcode.generate(qr, { small: true });
                console.log(qrstr);
            }

            if(connection === 'close') {
                const code = lastDisconnect?.error?.output?.statusCode;
                if (code !== DisconnectReason.loggedOut) setTimeout(Start, 5000)
            } else if(connection === 'open') {
                console.log('Koneksi Berhasil')
            }
        })

        conn.ev.on('messages.upsert', ({ messages }) => {
            console.log(JSON.stringify(messages, null, 2));
        })

        conn.ev.on('messages.update', (updates) => {
            for (const update of updates) {
                console.log('Update:', update.key.id, update.update.status);
            }
        })

        conn.ev.on('chats.update', (updates) => {
            console.log(JSON.stringify(updates, null, 2))
        })

        conn.ev.on('presence.update', (tes) => {
            console.log(tes)
        })

        sock = conn;
        return sock;
    }

    await Start();

    const express = require('express');
    const port = 3000;

    const app = express();
    app.use(express.json());

    app.get('/sendText', async (req, res) => {
        const { to, message } = req.query;

        const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
        try {
            const msg = await sock.sendMessage(jid, { text: message });
            res.json({ success: true, id: msg.key.id });
        } catch (e) {
            res.status(500).json({  error: e.message })
        }
        // console.log(req)
    })

    app.get('/sendImage', async (req, res) => {
        const { to, message, url } = req.query;

        const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
        try {
            const msg = await sock.sendMessage(jid, { image: { url }, caption: message });
            res.json({ success: true, id: msg.key.id });
        } catch (e) {
            res.status(500).json({  error: e.message })
        }
        // console.log(req)
    })

    app.listen(port, () => console.log(`http://localhost:${port}`))

}) ();