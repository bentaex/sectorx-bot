import { SlashCommand } from '../types/index.js';
import { ChatInputCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';

const data = {
  name: 'ticket',
  description: 'Erstelle ein IC-Ticket für Sector X',
} as const;

async function execute(interaction: ChatInputCommandInteraction) {
  const category = interaction.options.getString('kategorie') || 'other';

  const modal = new ModalBuilder()
    .setCustomId(`ticket-modal-${category}`)
    .setTitle(`${getCategoryEmoji(category)} ${getCategoryName(category)} Ticket`);

  const subjectInput = new TextInputBuilder()
    .setCustomId('ticket-subject')
    .setLabel('Betreff (Kurz)')
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100);

  const descriptionInput = new TextInputBuilder()
    .setCustomId('ticket-description')
    .setLabel('Beschreibung')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(2000);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(subjectInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(descriptionInput)
  );

  await interaction.showModal(modal);
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    medic: '🏥',
    events: '🎪',
    medchip: '💉',
    other: '📝',
  };
  return emojis[category] || '📝';
}

function getCategoryName(category: string): string {
  const names: Record<string, string> = {
    medic: 'Medic',
    events: 'Events',
    medchip: 'Med-Chip Vorlage',
    other: 'Sonstiges',
  };
  return names[category] || 'Sonstiges';
}

export default { data, execute } as SlashCommand;
