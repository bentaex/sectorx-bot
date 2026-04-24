import { Client, Message, EmbedBuilder } from 'discord.js';
import { openai } from '../index.js';

const AI_CHANNEL_ID = process.env.AI_CHANNEL_ID;

export default async function messageCreate(message: Message, client: Client) {
  // Ignore bots
  if (message.author.bot) return;

  // Check if in AI channel or mentioned the bot
  const isAiChannel = message.channelId === AI_CHANNEL_ID;
  const mentionedBot = message.mentions.has(client.user!);

  if (!isAiChannel && !mentionedBot) return;

  if (!openai) return;

  // Check if message mentions bot
  const userQuestion = mentionedBot 
    ? message.content.replace(`<@${client.user?.id}>`, '').trim()
    : message.content;

  if (!userQuestion) return;

  // Typing indicator
  if (!message.channel.isSendable()) return;
  await message.channel.sendTyping();

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Du bist SectorBot, ein hilfreicher Assistent für den Sector X RP Discord Server. Antworte freundlich und hilfreich auf Deutsch. Der Server ist ein Rollenspiel-Server mit Themen wie Medic, Events und Med-Chips.'
        },
        {
          role: 'user',
          content: userQuestion
        }
      ],
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content || 'Entschuldigung, ich konnte keine Antwort generieren.';

    if (isAiChannel || mentionedBot) {
      await message.reply({
        content: response
      });
    }
  } catch (error) {
    console.error('OpenAI Error:', error);
    await message.reply({
      content: '❌ Entschuldigung, ich hatte ein Problem. Versuche es später erneut.'
    });
  }
}
