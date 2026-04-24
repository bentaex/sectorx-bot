import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'tickets.db');
const db = new Database(dbPath);

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

  CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
  CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id);
  CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);
`);

export interface Ticket {
  id: number;
  ticket_id: string;
  user_id: string;
  username: string;
  category: 'medic' | 'events' | 'medchip' | 'other';
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  closed_by: string | null;
}

export interface TicketMessage {
  id: number;
  ticket_id: string;
  author_id: string;
  author_name: string;
  content: string;
  is_ic: number;
  created_at: string;
}

export const ticketQueries = {
  create: db.prepare(`
    INSERT INTO tickets (ticket_id, user_id, username, category, subject, description)
    VALUES (@ticket_id, @user_id, @username, @category, @subject, @description)
  `),

  getById: db.prepare(`SELECT * FROM tickets WHERE ticket_id = ?`),
  
  getAll: db.prepare(`SELECT * FROM tickets ORDER BY created_at DESC`),
  
  getByStatus: db.prepare(`SELECT * FROM tickets WHERE status = ? ORDER BY created_at DESC`),
  
  getByUser: db.prepare(`SELECT * FROM tickets WHERE user_id = ? ORDER BY created_at DESC`),

  updateStatus: db.prepare(`
    UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE ticket_id = ?
  `),

  close: db.prepare(`
    UPDATE tickets SET status = 'closed', closed_at = CURRENT_TIMESTAMP, closed_by = ? WHERE ticket_id = ?
  `),

  addMessage: db.prepare(`
    INSERT INTO ticket_messages (ticket_id, author_id, author_name, content, is_ic)
    VALUES (@ticket_id, @author_id, @author_name, @content, @is_ic)
  `),

  getMessages: db.prepare(`
    SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC
  `),
};

export default db;
