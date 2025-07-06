// node_server.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const os = require('os');
const qrcode = require('qrcode-terminal');

const app = express();
const port = 3000;

// Create required folders if not exist
['uploads', 'downloads', 'logs'].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Multer setup
const upload = multer({ dest: 'uploads/' });
const share = multer({ dest: 'downloads/' });

// GET Home Page
app.get('/', (req, res) => {
    const downloadFiles = fs.readdirSync('downloads');

    const metadata = {
        "IP Address": req.ip || req.connection.remoteAddress,
        "User-Agent": req.headers['user-agent'],
        "Accept-Language": req.headers['accept-language']
    };

    let prefilled_text = Object.entries(metadata).map(([k, v]) => `${k}: ${v}`).join("\n");
    prefilled_text += "\n\n--- Clipboard Content Below (if accessible) ---";

    res.render('index_node', { files: downloadFiles, prefilled_text });
});

// POST Submit Text
app.post('/submit', (req, res) => {
    const text = req.body.text || '';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    const logFile = path.join('logs', `log_${timestamp}.txt`);
    fs.writeFileSync(logFile, `Submitted Text:\n${text}`);
    res.redirect('/');
});

// POST Upload
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.redirect('/');
    const target = path.join('uploads', req.file.originalname);
    fs.renameSync(req.file.path, target);
    res.redirect('/');
});

// POST Share
app.post('/share', share.single('file'), (req, res) => {
    if (!req.file) return res.redirect('/');
    const target = path.join('downloads', req.file.originalname);
    fs.renameSync(req.file.path, target);
    res.redirect('/');
});

// GET Download Individual File
app.get('/downloads/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, 'downloads', filename);
    res.download(filepath);
});

// GET Download All as ZIP
app.get('/download_all', (req, res) => {
    const archive = archiver('zip', { zlib: { level: 9 } });

    res.attachment('all_downloads.zip');
    archive.pipe(res);

    fs.readdirSync('downloads').forEach(file => {
        const filepath = path.join('downloads', file);
        archive.file(filepath, { name: file });
    });

    archive.finalize();
});

// Start Server
const host = '0.0.0.0';
let selectedIP = null;

app.listen(port, host, () => {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.keys(interfaces)) {
        for (const addr of interfaces[iface]) {
            if (addr.family === 'IPv4' && !addr.internal && addr.address.startsWith('192.168.')) {
                selectedIP = addr.address;
                break;
            }
        }
        if (selectedIP) break;
    }

    if (selectedIP) {
        const url = `http://${selectedIP}:${port}`;
        console.log(`Node server running at ${url}`);
        qrcode.generate(url, { small: true });
    } else {
        console.log(`Node server running on unknown LAN IP at port ${port}`);
    }
});

//if npm is not running open powershell as admin and do-> Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
// npm install qrcode-terminal
// npm install express multer archiver ejs