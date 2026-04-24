# 🎮 Sector X - Discord Bot & Ticket System

Ein Discord Bot für den **Sector X RP Server** mit integriertem Web-Ticket-Dashboard.

## Features

### 🤖 Discord Bot
- **📊 Server Stats** - Detaillierte Server-Statistiken
- **🎫 IC-Ticket System** - Kategorien: Medic, Events, Med-Chip Vorlage, Sonstiges
- **📝 Embed Generator** - Erstellen von Embeds für Moderatoren
- **👋 Willkommensnachrichten** - Automatische DMs und Channel-Nachrichten
- **🎮 Support-Raum Move Bot** - Automatisch private Voice-Channels erstellen

### 🌐 Web Dashboard
- **Echtzeit-Ticket-Übersicht** - Alle Tickets auf einen Blick
- **Filter & Suche** - Nach Status, Kategorie und Text filtern
- **Ticket-Details** - Beschreibung, Nachrichten, Status-Änderungen
- **IC/OOC-Nachrichten** - Unterscheidung zwischen In-Character und Out-of-Character
- **Responsive Design** - Funktioniert auf Desktop und Mobile

## Setup

### 1. Discord Bot erstellen

1. Gehe zu [Discord Developer Portal](https://discord.com/developers/applications)
2. Klicke auf "New Application"
3. Navigiere zu "Bot" und erstelle einen Bot
4. Kopiere den **Token**

### 2. Bot einladen

Erstelle einen OAuth2 Link mit folgenden Scopes:
- `bot`
- `applications.commands`

Füge diese Permissions hinzu:
- View Channels
- Send Messages
- Manage Channels
- Manage Roles
- Read Message History

### 3. Environment Variables

```bash
cp .env.example .env
```

Bearbeite `.env` mit deinen Werten:

```env
BOT_TOKEN=your_bot_token
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id
TICKET_CATEGORY_ID=category_id_for_tickets
TICKET_CHANNEL_ID=channel_id_for_notifications
```

### 4. Installation

```bash
# Bot installieren
npm install

# Web Dashboard installieren
cd web && npm install && cd ..

# Bot starten (Development)
npm run dev

# Web Dashboard starten (in neuem Terminal)
cd web && npm start
```

### 5. Slash Commands deployen

```bash
npm run deploy
```

## Discord Commands

| Befehl | Beschreibung |
|--------|-------------|
| `/serverstats` | Zeigt Server-Statistiken |
| `/ticket [kategorie]` | Erstelle ein IC-Ticket |
| `/ticket-list [status]` | Liste alle Tickets auf |
| `/ticket-close` | Schließe das aktuelle Ticket |
| `/embed` | Erstelle einen Embed |
| `/help` | Zeigt alle Befehle |

## Ticket-Kategorien

| Kategorie | Emoji | Beschreibung |
|-----------|-------|-------------|
| Medic | 🏥 | Medizinische IC-Anfragen |
| Events | 🎪 | Event-Anfragen und Organisation |
| Med-Chip | 💉 | Anfragen für Med-Chip Vorlagen |
| Sonstiges | 📝 | Andere Anliegen |

## Web Dashboard

Das Dashboard läuft standardmäßig auf `http://localhost:3001`.

### Features
- 📊 Echtzeit-Statistiken
- 🔍 Volltextsuche
- 🏷️ Filter nach Status
- 💬 IC/OOC-Nachrichten
- ✅ Tickets übernehmen
- 🔒 Tickets schließen

## Struktur

```
sectorx-bot/
├── src/
│   ├── commands/         # Discord Slash Commands
│   ├── events/           # Discord Event Handler
│   ├── db/               # SQLite Datenbank
│   └── types/            # TypeScript Typen
├── web/
│   ├── server.js         # Express Server
│   └── public/           # Web Dashboard
├── data/                 # SQLite Datenbank (auto-created)
├── .env                  # Environment Variablen
└── README.md
```

## Lizenz

MIT License
