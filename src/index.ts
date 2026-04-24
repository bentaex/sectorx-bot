import { Client, GatewayIntentBits, Collection, REST, Routes, Partials, ModalSubmitInteraction, TextChannel } from 'discord.js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

import type { SlashCommand, TicketCategory } from './types/index.js';
import { ticketQueries } from './db/database.js';

// Import commands
import serverStats from './commands/serverstats.js';
import ticket from './commands/ticket.js';
import ticketList from './commands/ticket-list.js';
import ticketClose from './commands/ticket-close.js';
import embed from './commands/embed.js';
import ai from './commands/ai.js';
import help from './commands/help.js';

// Import events
import ready from './events/ready.js';
import guildMemberAdd from './events/guildMemberAdd.js';
import interactionCreate from './events/interactionCreate.js';
import voiceStateUpdate from './events/voiceStateUpdate.js';
import messageCreate from './events/messageCreate.js';
import modalSubmit from './events/modalSubmit.js';

const BOT_TOKEN = process.env.BOT_TOKEN!;
const CLIENT_ID = process.env.CLIENT_ID!;
const GUILD_ID = process.env.GUILD_ID!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const WEBHOOK_URL = process.env.WEBHOOK_URL!;
const TICKET_CATEGORY_ID = process.env.TICKET_CATEGORY_ID!;
const TICKET_CHANNEL_ID = process.env.TICKET_CHANNEL_ID!;
const WAITING_ROOM_NAME = process.env.WAITING_ROOM_NAME || 'Wartesaal';
const PRIVATE_CHANNEL_NAME = process.env.PRIVATE_CHANNEL_NAME || 'support';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Webhooks,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User],
});

// OpenAI Client
export const openai = process.env.OPENAI_API_KEY ? new (await import('openai')).OpenAI({ apiKey: OPENAI_API_KEY }) : null;

// Collections
export const commands = new Collection<string, SlashCommand>();
export const cooldowns = new Collection<string, Collection<string, number>>();

// Register commands
const commandFiles = [
  { name: 'serverstats', command: serverStats },
  { name: 'ticket', command: ticket },
  { name: 'ticket-list', command: ticketList },
  { name: 'ticket-close', command: ticketClose },
  { name: 'embed', command: embed },
  { name: 'ai', command: ai },
  { name: 'help', command: help },
];

for (const { name, command } of commandFiles) {
  commands.set(name, command);
}

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Deploy slash commands
async function deployCommands() {
  const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);
  
  const commandData = commandFiles.map(({ command }) => command.data);

  try {
    console.log('Deploying slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commandData }
    );
    console.log('Slash commands deployed successfully!');
  } catch (error) {
    console.error('Error deploying commands:', error);
  }
}

// Export support config
export const supportConfig = {
  waitingRoomName: WAITING_ROOM_NAME,
  privateChannelName: PRIVATE_CHANNEL_NAME,
  ticketCategoryId: TICKET_CATEGORY_ID,
  ticketChannelId: TICKET_CHANNEL_ID,
  webhookUrl: WEBHOOK_URL,
};

// Event handlers
client.on('ready', () => ready(client));
client.on('guildMemberAdd', (member) => guildMemberAdd(member, client));
client.on('interactionCreate', (interaction) => interactionCreate(interaction, client));
client.on('voiceStateUpdate', (oldState, newState) => voiceStateUpdate(oldState, newState, client, supportConfig));
client.on('messageCreate', (message) => messageCreate(message, client));
client.on('modalSubmit', (modal) => modalSubmit(modal as ModalSubmitInteraction, client, supportConfig));

// Login
deployCommands().then(() => {
  client.login(BOT_TOKEN);
});
