const { makeWASocket, useMultiFileAuthState, Browsers } = require('baileys');
const qrcode = require('qrcode-terminal')
// const qrcode = require('qrcode');
const NodeCache = require('node-cache')
const groupCache = new NodeCache({stdTTL: 5 * 60, useClones: false})

const global = {
    ownerNumber: 6283127596164,
    ownerName: 'Zilfa Ardiansyah',
    creator: 'Jilpa Dev',
    botNumber: 6281809185780
}

const Start = async () => {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    
    const sock = makeWASocket({
        auth: state,
        browser: Browsers.windows(global.creator),
        // printQRInTerminal: false,
        syncFullHistory: true,
        cachedGroupMetadata: async (jid) => groupCache.get(jid)
    });
    
    sock.ev.on('connection.update', async (update) => {
        const { connection, qr } = update;

        if(qr) {
            // const qrstr = await qrcode.generate(qr, { type: 'terminal' })
            const qrstr = await qrcode.generate(qr, { small: true })
            console.log(qrstr)
        }
        
        if (connection === 'open') {
            console.log('✅ Terhubung ke WhatsApp');
        }

        if (connection === 'close') {
            console.log('❌ Koneksi ditutup. Menyambung ulang...');
            Start(); // optional: reconnect otomatis
        }
    });

    
    sock.ev.on('creds.update', saveCreds)
    
    sock.ev.on('messages.upsert', ({ messages }) => {
        // console.log('got messages', messages)
        console.log(JSON.stringify(messages, null, 2))

    })
}

Start();