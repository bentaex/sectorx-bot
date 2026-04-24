import { SlashCommand } from '../types/index.js';
import { ChatInputCommandInteraction } from 'discord.js';
import { ticketQueries } from '../db/database.js';

const data = {
  name: 'ticket-close',
  description: 'Schließe das aktuelle Ticket',
} as const;

async function execute(interaction: ChatInputCommandInteraction) {
  const channel = interaction.channel;

  if (!channel?.name.startsWith('🏥') && !channel?.name.startsWith('🎪') && 
      !channel?.name.startsWith('💉') && !channel?.name.startsWith('📝') &&
      !channel?.name.includes('SX-')) {
    return interaction.reply({
      content: '❌ Dies ist kein Ticket-Kanal.',
      ephemeral: true,
    });
  }

  // Extract ticket ID from channel name
  const ticketIdMatch = channel.name.match(/SX-[A-Z0-9]+/);
  if (!ticketIdMatch) {
    return interaction.reply({
      content: '❌ Ticket-ID nicht gefunden.',
      ephemeral: true,
    });
  }

  const ticketId = ticketIdMatch[0];

  try {
    // Update database
    ticketQueries.close(interaction.user.id, ticketId);

    await interaction.reply(`✅ Ticket **#${ticketId}** wird in 5 Sekunden geschlossen...`);

    setTimeout(async () => {
      try {
        await channel.delete();
      } catch (error) {
        console.error('Error closing ticket:', error);
      }
    }, 5000);
  } catch (error) {
    console.error('Error closing ticket:', error);
    await interaction.reply({ content: '❌ Fehler beim Schließen des Tickets.' });
  }
}

export default { data, execute } as SlashCommand;
