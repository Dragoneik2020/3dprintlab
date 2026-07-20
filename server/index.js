const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');
const nodemailer = require('nodemailer');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, 'data.db');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

var db;

function initDatabase() {
  try {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.exec(
      'CREATE TABLE IF NOT EXISTS site_data (' +
      'id INTEGER PRIMARY KEY CHECK (id = 1), ' +
      'data TEXT NOT NULL, ' +
      'updated_at TEXT NOT NULL' +
      ')'
    );
    var row = db.prepare('SELECT id FROM site_data WHERE id = 1').get();
    if (!row) {
      db.prepare('INSERT INTO site_data (id, data, updated_at) VALUES (1, ?, ?)').run('{}', new Date().toISOString());
    }
    console.log('OK Base de datos SQLite lista');
    return true;
  } catch (err) {
    console.error('Error al crear la DB:', err.message);
    return false;
  }
}

app.get('/api/health', function(req, res) {
  res.json({ status: 'ok', db: db ? 'connected' : 'disconnected' });
});

app.get('/api/data', function(req, res) {
  try {
    if (!db) throw new Error('DB no conectada');
    var row = db.prepare('SELECT data, updated_at FROM site_data WHERE id = 1').get();
    if (!row) return res.json({ data: {}, updated_at: null });
    res.json({ data: JSON.parse(row.data), updated_at: row.updated_at });
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

app.put('/api/data', function(req, res) {
  try {
    if (!db) throw new Error('DB no conectada');
    var data = req.body.data;
    if (!data) return res.status(400).json({ error: 'Missing data' });
    var jsonStr = JSON.stringify(data);
    var now = new Date().toISOString();
    var existing = db.prepare('SELECT id FROM site_data WHERE id = 1').get();
    if (existing) {
      db.prepare('UPDATE site_data SET data = ?, updated_at = ? WHERE id = 1').run(jsonStr, now);
    } else {
      db.prepare('INSERT INTO site_data (id, data, updated_at) VALUES (1, ?, ?)').run(jsonStr, now);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

app.post('/api/reset', function(req, res) {
  try {
    if (!db) throw new Error('DB no conectada');
    db.prepare('UPDATE site_data SET data = ?, updated_at = ? WHERE id = 1').run('{}', new Date().toISOString());
    res.json({ success: true });
  } catch (err) {
    res.status(503).json({ error: err.message });
  }
});

var transporter = null;
if (process.env.SMTP_USER && process.env.SMTP_USER !== 'tu_email@gmail.com') {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  console.log('SMTP configurado: ' + process.env.SMTP_USER);
} else {
  console.log('SMTP no configurado. Edita server/.env');
}

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.post('/api/contact', function(req, res) {
  try {
    var name = (req.body.name || '').trim();
    var email = (req.body.email || '').trim();
    var service = (req.body.service || '').trim();
    var size = (req.body.size || '').trim();
    var message = (req.body.message || '').trim();

    if (!name || !email) {
      return res.status(400).json({ error: 'Nombre y email son obligatorios' });
    }

    var html = '<h2>Nueva solicitud de cotizacion - 3DPrintLab</h2>' +
      '<p><strong>Nombre:</strong> ' + name + '</p>' +
      '<p><strong>Email:</strong> ' + email + '</p>' +
      '<p><strong>Servicio:</strong> ' + (service || 'No especificado') + '</p>' +
      '<p><strong>Tamano:</strong> ' + (size || 'No especificado') + '</p>' +
      '<p><strong>Mensaje:</strong></p><p>' + (message || '(sin mensaje)') + '</p>';

    if (transporter) {
      transporter.sendMail({
        from: '"3DPrintLab Web" <' + process.env.SMTP_USER + '>',
        to: process.env.CONTACT_TO || process.env.SMTP_USER,
        replyTo: email,
        subject: 'Cotizacion: ' + name + ' - ' + (service || 'General'),
        html: html
      }).then(function() {
        console.log('Email enviado: ' + name + ' <' + email + '>');
        res.json({ success: true });
      }).catch(function(err) {
        console.error('Error email:', err.message);
        res.status(500).json({ error: 'Error al enviar email' });
      });
    } else {
      console.log('--- Solicitud de contacto (SMTP no configurado) ---');
      console.log('Nombre:', name);
      console.log('Email:', email);
      console.log('Servicio:', service);
      console.log('Tamano:', size);
      console.log('Mensaje:', message);
      console.log('-----------------------------------------------');
      res.json({ success: true, note: 'Guardado en consola (configura SMTP en server/.env para enviar emails)' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use(express.static(path.join(__dirname, '..')));

var dbReady = initDatabase();
app.listen(PORT, function() {
  console.log('');
  console.log('Servidor: http://localhost:' + PORT);
  console.log('Admin:    http://localhost:' + PORT + '/admin/');
  console.log(dbReady ? 'DB: OK (SQLite)' : 'DB: ERROR');
  console.log('');
});
