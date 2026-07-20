const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

var db;
var Database;
try {
  Database = require('better-sqlite3');
} catch(e) {
  console.error('better-sqlite3 no disponible:', e.message);
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

function initDatabase() {
  if (!Database) return false;
  try {
    var dbPath = path.join(__dirname, 'data.db');
    db = new Database(dbPath);
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
    console.log('DB: OK (SQLite)');
    return true;
  } catch (err) {
    console.error('DB error:', err.message);
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
try {
  var nodemailer = require('nodemailer');
  require('dotenv').config({ path: path.join(__dirname, '.env') });
  if (process.env.SMTP_USER && process.env.SMTP_USER !== 'tu_email@gmail.com') {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    console.log('SMTP: ' + process.env.SMTP_USER);
  } else {
    console.log('SMTP: no configurado');
  }
} catch(e) {
  console.log('Nodemailer no disponible');
}

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

    var html = '<h2>Nueva solicitud - 3DPrintLab</h2>' +
      '<p><strong>Nombre:</strong> ' + name + '</p>' +
      '<p><strong>Email:</strong> ' + email + '</p>' +
      '<p><strong>Servicio:</strong> ' + (service || '-') + '</p>' +
      '<p><strong>Tamano:</strong> ' + (size || '-') + '</p>' +
      '<p><strong>Mensaje:</strong></p><p>' + (message || '-') + '</p>';

    if (transporter) {
      transporter.sendMail({
        from: '"3DPrintLab" <' + process.env.SMTP_USER + '>',
        to: process.env.CONTACT_TO || process.env.SMTP_USER,
        replyTo: email,
        subject: 'Cotizacion: ' + name,
        html: html
      }).then(function() {
        res.json({ success: true });
      }).catch(function(err) {
        console.error('Email error:', err.message);
        res.status(500).json({ error: 'Error al enviar' });
      });
    } else {
      console.log('--- Contacto: ' + name + ' <' + email + '> ---');
      res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use(express.static(path.join(__dirname, '..')));

app.get('/admin', function(req, res) {
  res.sendFile(path.join(__dirname, '..', 'admin', 'index.html'));
});
app.get('/admin/*', function(req, res) {
  res.sendFile(path.join(__dirname, '..', 'admin', req.path));
});
app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

var dbReady = initDatabase();
app.listen(PORT, '0.0.0.0', function() {
  console.log('Servidor: http://0.0.0.0:' + PORT);
  console.log('Admin:    http://0.0.0.0:' + PORT + '/admin/');
  console.log('DB: ' + (dbReady ? 'OK' : 'ERROR'));
});
