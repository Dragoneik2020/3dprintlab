const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');

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

app.use(express.static(path.join(__dirname, '..')));

var dbReady = initDatabase();
app.listen(PORT, function() {
  console.log('');
  console.log('Servidor: http://localhost:' + PORT);
  console.log('Admin:    http://localhost:' + PORT + '/admin/');
  console.log(dbReady ? 'DB: OK (SQLite)' : 'DB: ERROR');
  console.log('');
});
