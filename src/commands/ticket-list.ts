import { SlashCommand } from '../types/index.js';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { ticketQueries } from '../db/database.js';

const data = {
  name: 'ticket-list',
  description: 'Liste alle offenen Tickets auf',
} as const;

const CATEGORY_EMOJIS: Record<string, string> = {
  medic: '🏥',
  events: '🎪',
  medchip: '💉',
  other: '📝',
};

async function execute(interaction: ChatInputCommandInteraction) {
  const status = interaction.options.getString('status') || 'open';
  
  const tickets = ticketQueries.getByStatus(status);

  if (tickets.length === 0) {
    return interaction.reply({
      content: `📭 Keine Tickets mit Status **${status}** gefunden.`,
      ephemeral: true,
    });
  }

  const embed = new EmbedBuilder()
    .setColor(0x00D4AA)
    .setTitle(`🎫 Tickets (${status})`)
    .setDescription(`Anzahl: ${tickets.length}`)
    .setTimestamp();

  // Group by category
  const byCategory = tickets.reduce((acc, ticket) => {
    if (!acc[ticket.category]) acc[ticket.category] = [];
    acc[ticket.category].push(ticket);
    return acc;
  }, {} as Record<string, typeof tickets>);

  for (const [category, categoryTickets] of Object.entries(byCategory)) {
    const ticketList = categoryTickets
      .slice(0, 10)
      .map((t) => `${CATEGORY_EMOJIS[category] || '📝'} **#${t.ticket_id}** - ${t.subject} (${t.username})`)
      .join('\n');
    
    embed.addFields({
      name: `${CATEGORY_EMOJIS[category] || '📝'} ${category.toUpperCase()}`,
      value: ticketList || 'Keine',
      inline: false,
    });
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

export default { data, execute } as SlashCommand;
