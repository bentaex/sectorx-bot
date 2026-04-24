import { Interaction, ChatInputCommandInteraction, Client, ButtonInteraction } from 'discord.js';
import { commands } from '../index.js';
import { ticketQueries } from '../db/database.js';

export default async function interactionCreate(interaction: Interaction, client: Client) {
  // Handle button interactions
  if (interaction.isButton()) {
    const customId = interaction.customId;
    
    if (customId.startsWith('ticket-claim-') || customId.startsWith('ticket-close-')) {
      await interaction.deferReply({ ephemeral: true });
      
      const ticketId = customId.replace('ticket-claim-', '').replace('ticket-close-', '');
      const isClaim = customId.startsWith('ticket-claim-');
      
      if (isClaim) {
        ticketQueries.updateStatus.run('in_progress', ticketId);
        
        // Update the message
        await interaction.editReply({ content: `✅ Ticket **#${ticketId}** wurde übernommen!` });
        
        // Update the channel embed with claimed info
        const channel = interaction.channel;
        if (channel && channel.isTextBased()) {
          const messages = await channel.messages.fetch();
          const ticketMsg = messages.first();
          if (ticketMsg && ticketMsg.embeds[0]) {
            const oldEmbed = ticketMsg.embeds[0];
            const newEmbed = oldEmbed.setFields(
              ...oldEmbed.fields.map(f => 
                f.name === '📊 Status' ? { name: '📊 Status', value: '🟡 In Bearbeitung', inline: true } : f
              )
            );
            await ticketMsg.edit({ embeds: [newEmbed] });
          }
        }
      } else {
        // Close ticket
        ticketQueries.close(interaction.user.id, ticketId);
        await interaction.editReply({ content: `✅ Ticket **#${ticketId}** wird geschlossen...` });
        
        setTimeout(async () => {
          try {
            const channel = interaction.channel;
            if (channel) await channel.delete();
          } catch (error) {
            console.error('Error closing channel:', error);
          }
        }, 3000);
      }
      
      return;
    }
    
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const commandName = interaction.commandName;
  const command = commands.get(commandName);

  if (!command) {
    return interaction.reply({
      content: '❌ Dieser Befehl existiert nicht.',
      ephemeral: true,
    });
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing command ${commandName}:`, error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    await interaction.reply({
      content: `❌ Ein Fehler ist aufgetreten: ${errorMessage}`,
      ephemeral: true,
    }).catch(() => {});
  }
}
