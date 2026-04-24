import { ModalSubmitInteraction, Client, EmbedBuilder, ChannelType, CategoryChannel, PermissionFlagsBits, TextChannel, WebhookClient } from 'discord.js';
import { v4 as uuidv4 } from 'uuid';
import type { SupportConfig, TicketCategory } from '../types/index.js';
import { ticketQueries } from '../db/database.js';

const CATEGORY_EMOJIS: Record<string, string> = {
  medic: '🏥',
  events: '🎪',
  medchip: '💉',
  other: '📝',
};

const CATEGORY_NAMES: Record<string, string> = {
  medic: 'Medic',
  events: 'Events',
  medchip: 'Med-Chip Vorlage',
  other: 'Sonstiges',
};

export default async function modalSubmit(interaction: ModalSubmitInteraction, client: Client, config: SupportConfig) {
  const customId = interaction.customId;
  
  if (!customId.startsWith('ticket-modal-')) return;

  const category = customId.replace('ticket-modal-', '') as TicketCategory;
  const subject = interaction.fields.getTextInputValue('ticket-subject');
  const description = interaction.fields.getTextInputValue('ticket-description');
  const user = interaction.user;

  await interaction.deferReply({ ephemeral: true });

  try {
    // Create ticket ID
    const ticketId = `SX-${uuidv4().slice(0, 8).toUpperCase()}`;

    // Save to database
    ticketQueries.create({
      ticket_id: ticketId,
      user_id: user.id,
      username: user.username,
      category,
      subject,
      description,
    });

    // Get ticket channel
    const ticketChannel = client.channels.cache.get(config.ticketChannelId) as TextChannel;
    
    if (!ticketChannel) {
      await interaction.editReply({ content: '❌ Ticket-Channel nicht gefunden.' });
      return;
    }

    // Create Discord channel for the ticket
    const category = client.channels.cache.get(config.ticketCategoryId) as CategoryChannel;
    
    const ticketDiscordChannel = await interaction.guild!.channels.create({
      name: `${CATEGORY_EMOJIS[category] || '📝'}-${ticketId}`,
      type: ChannelType.GuildText,
      parent: config.ticketCategoryId,
      permissionOverwrites: [
        {
          id: interaction.guild!.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
        },
      ],
    });

    // Send ticket embed to the channel
    const ticketEmbed = new EmbedBuilder()
      .setColor(0x0071E3)
      .setTitle(`${CATEGORY_EMOJIS[category] || '📝'} Ticket #${ticketId}`)
      .setDescription(description)
      .addFields(
        { name: '👤 Ersteller', value: `${user} (${user.username})`, inline: true },
        { name: '📁 Kategorie', value: `${CATEGORY_EMOJIS[category] || '📝'} ${CATEGORY_NAMES[category] || category}`, inline: true },
        { name: '📋 Betreff', value: subject, inline: false },
        { name: '⏰ Erstellt', value: new Date().toLocaleString('de-DE'), inline: true },
        { name: '📊 Status', value: '🟢 Offen', inline: true }
      )
      .setTimestamp();

    // Add action buttons
    const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = await import('discord.js');
    
    const claimBtn = new ButtonBuilder()
      .setCustomId(`ticket-claim-${ticketId}`)
      .setLabel('✅ Übernehmen')
      .setStyle(ButtonStyle.Success);

    const closeBtn = new ButtonBuilder()
      .setCustomId(`ticket-close-${ticketId}`)
      .setLabel('🔒 Schließen')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(claimBtn, closeBtn);

    await ticketDiscordChannel.send({ embeds: [ticketEmbed], components: [row] });

    // Send notification to user
    await interaction.editReply({
      content: `✅ Ticket **#${ticketId}** erstellt!\nDein Channel: ${ticketDiscordChannel}`,
    });

    // Also send to webhook for web interface
    if (config.webhookUrl) {
      const webhookClient = new WebhookClient({ url: config.webhookUrl });
      await webhookClient.send({
        content: `🎫 Neues Ticket #${ticketId} erstellt!`,
        embeds: [ticketEmbed],
      });
    }
  } catch (error) {
    console.error('Ticket creation error:', error);
    await interaction.editReply({ content: '❌ Fehler beim Erstellen des Tickets.' });
  }
}
