require('dotenv').config()
const fs = require('fs');
const https = require('https');
const http = require('http');
const express = require('express');
const {Server} = require('socket.io');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const crypto = require('crypto')

// Load PEM files (certificate, key, and optional CA certificate)
const privateKey = fs.readFileSync('./certs/server-key.pem', 'utf8');
const certificate = fs.readFileSync('./certs/server-cert.pem', 'utf8');
const ca = fs.readFileSync('./certs/ca-cert.pem', 'utf8'); // Optional, if using a custom CA

// Create an HTTPS service using the Express app
const credentials = {key: privateKey, cert: certificate, ca: ca}; // If you have the CA cert

const app = express();

app.use(cors({
    origin: '*',
})); // Enable CORS for all routes and origins

// Set storage and filename configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Save files in uploads directory
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${crypto.randomUUID()}`);
    }
});

// File filter to allow only specific types (e.g., images)
const allowedTypes = ['application/octet-stream'];
const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

// Set limits for uploaded files (e.g., 1000MB max size)
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {fileSize: 1000 * 1024 * 1024}
});

let server
if (process.env.HTTPS === 'true') {
    // Create an HTTPS server with Express
    server = https.createServer(credentials, app);
} else {
    server = http.createServer(app)
}

// Initialize Socket.IO on the HTTPS server
const io = new Server(server, {
    cors: {
        origin: process.env.CORS.split(','), // client URL allowed to connect
    }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log('New Connection', new Date().toLocaleTimeString());

    socket.on('request_hand_shake', (data) => {
        io.emit(data.id, {event: 'request_hand_shake', data: data});
    });

    socket.on('accept_hand_shake', (data) => {
        io.emit(data.id, {event: 'accept_hand_shake', data: data});
    });

    socket.on('begin_session', (data) => {
        io.emit(data.id, {event: 'begin_session', data: {master_key: data.master_key, hash_key: data.hash_key}});
    });

    socket.on('message', (data) => {
        io.emit(data.id, {
            event: 'message',
            message: data.content,
            attributes: data.attributes,
            iv: data.iv,
            hash: data.hash,
        });
    });

    // Handle socket disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Endpoint for file upload
app.post('/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({error: 'No file uploaded'});
        }

        const data = req.body;
        const attributes = JSON.parse(data.attributes);

        // Generate a public URL for the uploaded file
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        // sent the full message
        io.emit(data.id, {event: 'message', message: fileUrl, attributes: attributes, hash: data.hash, iv: data.iv});

        res.json({message: 'File uploaded successfully', size: req.file.size, url: fileUrl});
    } catch (err) {
        res.header(500).json({error: err});
    }
});

// Start the server on a secure port (e.g., 443 for HTTPS)
const PORT = 443;  // Default HTTPS port
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Secure server running on https://localhost:${PORT}`);
});
