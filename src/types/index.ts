import { RESTPostAPIApplicationCommandsJSONBody, ChatInputCommandInteraction } from 'discord.js';

export type TicketCategory = 'medic' | 'events' | 'medchip' | 'other';

export interface SlashCommand {
  data: RESTPostAPIApplicationCommandsJSONBody;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface SupportConfig {
  waitingRoomName: string;
  privateChannelName: string;
  ticketCategoryId: string;
  ticketChannelId: string;
  webhookUrl: string;
}

export interface TicketData {
  ticket_id: string;
  user_id: string;
  username: string;
  category: TicketCategory;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'closed';
  created_at: string;
}

export interface TicketMessageData {
  ticket_id: string;
  author_id: string;
  author_name: string;
  content: string;
  is_ic: boolean;
  created_at: string;
}

export const TICKET_CATEGORIES: Record<TicketCategory, { emoji: string; name: string; description: string }> = {
  medic: {
    emoji: '🏥',
    name: 'Medic',
    description: 'Medizinische Anfragen und Notfälle IC',
  },
  events: {
    emoji: '🎪',
    name: 'Events',
    description: 'Event-Anfragen und Organisation',
  },
  medchip: {
    emoji: '💉',
    name: 'Med-Chip Vorlage',
    description: 'Anfragen für Med-Chip Vorlagen',
  },
  other: {
    emoji: '📝',
    name: 'Sonstiges',
    description: 'Sonstige Anliegen',
  },
};
