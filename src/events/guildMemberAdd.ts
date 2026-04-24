import { GuildMember, Client, EmbedBuilder } from 'discord.js';

export default async function guildMemberAdd(member: GuildMember, client: Client) {
  const guild = member.guild;
  
  // Find welcome channel
  const welcomeChannel = guild.channels.cache.find(
    (ch) => ch.name === 'willkommen' || ch.name === 'welcome' || ch.name === 'welcome-center'
  );

  if (!welcomeChannel || !welcomeChannel.isTextBased()) return;

  const embed = new EmbedBuilder()
    .setColor(0x00D4AA)
    .setTitle('👋 Willkommen bei Sector X!')
    .setDescription(`Willkommen ${member.user} auf dem **Sector X RP Server**!`)
    .addFields(
      { name: '📛 Name', value: member.user.tag, inline: true },
      { name: '👤 Mitglied seit', value: new Date().toLocaleDateString('de-DE'), inline: true },
      { name: '📊 Mitglieder', value: `${guild.memberCount}`, inline: true }
    )
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp()
    .setFooter({ text: 'Sector X RP Server' });

  await welcomeChannel.send({ embeds: [embed] });

  // Also try to send DM welcome
  try {
    const dmEmbed = new EmbedBuilder()
      .setColor(0x00D4AA)
      .setTitle('👋 Willkommen bei Sector X!')
      .setDescription(`Hallo ${member.user.username}, willkommen auf **Sector X**!\n\nWir sind ein RP-Server und freuen uns auf dich!`)
      .addFields(
        { name: '📜 Regeln', value: 'Bitte lies die Regeln im #regeln Channel.' },
        { name: '🎫 Tickets', value: 'Nutze /ticket um ein IC-Ticket zu erstellen.' },
        { name: '❓ Hilfe', value: 'Nutze /help für alle Befehle.' }
      )
      .setTimestamp();

    await member.send({ embeds: [dmEmbed] });
  } catch (error) {
    // User might have DMs disabled
    console.log(`Could not DM ${member.user.tag}`);
  }
}
