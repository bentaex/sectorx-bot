const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'tickets.db'));

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    category TEXT NOT NULL,
    subject TEXT,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    closed_at DATETIME,
    closed_by TEXT
  );

  CREATE TABLE IF NOT EXISTS ticket_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id TEXT NOT NULL,
    author_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    is_ic INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id)
  );
`);

// API Routes

// Get all tickets
app.get('/api/tickets', (req, res) => {
  const { status, category } = req.query;
  
  let query = 'SELECT * FROM tickets';
  const params = [];
  const conditions = [];
  
  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }
  
  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY created_at DESC';
  
  const tickets = db.prepare(query).all(...params);
  res.json(tickets);
});

// Get single ticket with messages
app.get('/api/tickets/:ticketId', (req, res) => {
  const ticket = db.prepare('SELECT * FROM tickets WHERE ticket_id = ?').get(req.params.ticketId);
  
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket nicht gefunden' });
  }
  
  const messages = db.prepare('SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC').all(req.params.ticketId);
  
  res.json({ ...ticket, messages });
});

// Create ticket
app.post('/api/tickets', (req, res) => {
  const { ticket_id, user_id, username, category, subject, description } = req.body;
  
  if (!ticket_id || !user_id || !username || !category || !description) {
    return res.status(400).json({ error: 'Fehlende Felder' });
  }
  
  try {
    db.prepare(`
      INSERT INTO tickets (ticket_id, user_id, username, category, subject, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(ticket_id, user_id, username, category, subject || '', description);
    
    res.json({ success: true, ticket_id });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Erstellen' });
  }
});

// Add message to ticket
app.post('/api/tickets/:ticketId/messages', (req, res) => {
  const { author_id, author_name, content, is_ic } = req.body;
  
  if (!author_id || !author_name || !content) {
    return res.status(400).json({ error: 'Fehlende Felder' });
  }
  
  try {
    db.prepare(`
      INSERT INTO ticket_messages (ticket_id, author_id, author_name, content, is_ic)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.params.ticketId, author_id, author_name, content, is_ic ? 1 : 0);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Hinzufügen der Nachricht' });
  }
});

// Update ticket status
app.patch('/api/tickets/:ticketId/status', (req, res) => {
  const { status, closed_by } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: 'Status erforderlich' });
  }
  
  try {
    if (status === 'closed') {
      db.prepare(`
        UPDATE tickets SET status = 'closed', closed_at = CURRENT_TIMESTAMP, closed_by = ?
        WHERE ticket_id = ?
      `).run(closed_by || 'system', req.params.ticketId);
    } else {
      db.prepare(`
        UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE ticket_id = ?
      `).run(status, req.params.ticketId);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Aktualisieren' });
  }
});

// Stats
app.get('/api/stats', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as count FROM tickets').get();
  const open = db.prepare("SELECT COUNT(*) as count FROM tickets WHERE status = 'open'").get();
  const inProgress = db.prepare("SELECT COUNT(*) as count FROM tickets WHERE status = 'in_progress'").get();
  const closed = db.prepare("SELECT COUNT(*) as count FROM tickets WHERE status = 'closed'").get();
  
  const byCategory = db.prepare(`
    SELECT category, COUNT(*) as count 
    FROM tickets 
    GROUP BY category
  `).all();
  
  res.json({
    total: total.count,
    open: open.count,
    inProgress: inProgress.count,
    closed: closed.count,
    byCategory
  });
});

// Serve SPA for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🌐 Sector X Ticket Dashboard läuft auf http://localhost:${PORT}`);
});
