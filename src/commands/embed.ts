import { SlashCommand } from '../types/index.js';
import { ChatInputCommandInteraction, EmbedBuilder, ChannelType } from 'discord.js';

const data = {
  name: 'embed',
  description: 'Erstelle einen Embed für Sector X',
} as const;

async function execute(interaction: ChatInputCommandInteraction) {
  const title = interaction.options.getString('titel') || 'Sector X';
  const description = interaction.options.getString('beschreibung') || '';
  const color = interaction.options.getString('farbe') || '#00D4AA';
  const channelId = interaction.options.getChannel('kanal');
  const footer = interaction.options.getString('footer');
  const thumbnail = interaction.options.getString('thumbnail');
  const image = interaction.options.getString('bild');

  const embedColor = parseInt(color.replace('#', ''), 16) || 0x00D4AA;

  const embed = new EmbedBuilder()
    .setColor(embedColor)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp()
    .setFooter(footer ? { text: footer } : { text: 'Sector X RP Server' });

  if (thumbnail) {
    embed.setThumbnail(thumbnail);
  }

  if (image) {
    embed.setImage(image);
  }

  if (channelId && channelId.type === ChannelType.GuildText) {
    await (channelId as any).send({ embeds: [embed] });
    await interaction.reply({
      content: `✅ Embed wurde in ${channelId} gesendet!`,
      ephemeral: true,
    });
  } else {
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
}

export default { data, execute } as SlashCommand;
