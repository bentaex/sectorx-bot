import { SlashCommand } from '../types/index.js';
import { EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';

const data = {
  name: 'help',
  description: 'Zeigt alle verfügbaren Befehle',
} as const;

async function execute(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder()
    .setColor(0x00D4AA)
    .setTitle('📚 Sector X Bot - Hilfe')
    .setDescription('Hier sind alle verfügbaren Befehle:')
    .addFields(
      { name: '📊 /serverstats', value: 'Zeigt Server-Statistiken', inline: false },
      { name: '🎫 /ticket [kategorie]', value: 'Erstelle ein IC-Ticket (medic, events, medchip, other)', inline: false },
      { name: '📋 /ticket-list [status]', value: 'Liste alle Tickets auf (open, in_progress, closed)', inline: false },
      { name: '🔒 /ticket-close', value: 'Schließe das aktuelle Ticket', inline: false },
      { name: '📝 /embed', value: 'Erstelle einen Embed (Moderatoren)', inline: false },
      { name: '📚 /help', value: 'Zeigt diese Hilfe', inline: false },
      { name: '\n🎮 Ticket-Kategorien', value: '🏥 **Medic** - Medizinische IC-Anfragen\n🎪 **Events** - Event-Anfragen\n💉 **Med-Chip** - Med-Chip Vorlagen\n📝 **Sonstiges** - Andere Anliegen', inline: false }
    )
    .setTimestamp()
    .setFooter({ text: 'Sector X RP Server' });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

export default { data, execute } as SlashCommand;
