import { VoiceState, Client, ChannelType, PermissionsBitField, CategoryChannel, TextChannel } from 'discord.js';
import type { SupportConfig } from '../types/index.js';

export default async function voiceStateUpdate(
  oldState: VoiceState,
  newState: VoiceState,
  client: Client,
  config: SupportConfig
) {
  // Check if user joined the waiting room
  const isWaitingRoom = newState.channel?.name.toLowerCase().includes(config.waitingRoomName.toLowerCase());
  const leftWaitingRoom = oldState.channel?.name.toLowerCase().includes(config.waitingRoomName.toLowerCase()) 
    && newState.channel?.id !== oldState.channel?.id;

  // User left waiting room - delete their private channel
  if (leftWaitingRoom) {
    const privateChannel = oldState.guild.channels.cache.find(
      (ch) => ch.name === `${config.privateChannelName}-${oldState.id}`
    );
    if (privateChannel && privateChannel.isVoiceBased()) {
      await privateChannel.delete().catch(() => {});
    }
  }

  // User joined waiting room - create private channel
  if (isWaitingRoom && newState.channel) {
    const member = newState.member;
    if (!member) return;

    try {
      // Create private voice channel for the user
      const privateChannel = await newState.guild.channels.create({
        name: `${config.privateChannelName}-${member.user.username}`,
        type: ChannelType.GuildVoice,
        parent: newState.channel.parent,
        permissionOverwrites: [
          {
            id: member.id,
            allow: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Speak],
          },
          {
            id: newState.guild.roles.everyone.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
        ],
      });

      // Move user to their new private channel
      await member.voice.setChannel(privateChannel);

      // Notify in ticket channel
      const ticketChannel = client.channels.cache.get(config.ticketChannelId) as TextChannel;
      
      if (ticketChannel && ticketChannel.isTextBased()) {
        await ticketChannel.send({
          content: `🎮 ${member.user} ist im Warteraum beigetreten und hat einen privaten Channel erstellt: ${privateChannel}`
        });
      }
    } catch (error) {
      console.error('Error creating private channel:', error);
    }
  }
}
