import { SlashCommand } from '../types/index.js';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

const data = {
  name: 'serverstats',
  description: 'Zeigt Server-Statistiken von Sector X',
} as const;

async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  
  if (!guild) {
    return interaction.reply({ content: '❌ Server nicht gefunden.', ephemeral: true });
  }

  const totalMembers = guild.memberCount;
  const onlineMembers = guild.members.cache.filter((m) => !m.user.bot && m.presence?.status === 'online').size;
  const bots = guild.members.cache.filter((m) => m.user.bot).size;
  const textChannels = guild.channels.cache.filter((c) => c.isTextBased() && !c.name.startsWith('ticket-')).size;
  const voiceChannels = guild.channels.cache.filter((c) => c.isVoiceBased()).size;
  const roles = guild.roles.cache.size;
  const emojis = guild.emojis.cache.size;

  const embed = new EmbedBuilder()
    .setColor(0x00D4AA)
    .setTitle(`📊 Sector X - Server Stats`)
    .setThumbnail(guild.iconURL() || '')
    .addFields(
      { name: '👥 Mitglieder', value: `${totalMembers} (${onlineMembers} online)`, inline: true },
      { name: '🤖 Bots', value: `${bots}`, inline: true },
      { name: '📝 Text-Kanäle', value: `${textChannels}`, inline: true },
      { name: '🔊 Sprach-Kanäle', value: `${voiceChannels}`, inline: true },
      { name: '🎭 Rollen', value: `${roles}`, inline: true },
      { name: '😊 Emojis', value: `${emojis}`, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: 'Sector X RP Server' });

  await interaction.reply({ embeds: [embed] });
}

export default { data, execute } as SlashCommand;
