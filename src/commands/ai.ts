import { SlashCommand } from '../types/index.js';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { openai } from '../index.js';

const data = {
  name: 'ai',
  description: 'Stelle dem Sector X AI Bot eine Frage',
} as const;

async function execute(interaction: ChatInputCommandInteraction) {
  const question = interaction.options.getString('frage');

  if (!question) {
    return interaction.reply({
      content: '❌ Bitte stelle eine Frage.',
      ephemeral: true,
    });
  }

  if (!openai) {
    return interaction.reply({
      content: '❌ AI ist nicht konfiguriert.',
      ephemeral: true,
    });
  }

  await interaction.reply({ content: '🤖 Denke nach...', fetchReply: true });

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
          content: question
        }
      ],
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content || 'Entschuldigung, keine Antwort erhalten.';

    const embed = new EmbedBuilder()
      .setColor(0x00D4AA)
      .setTitle('🤖 Sector X AI')
      .addFields(
        { name: '❓ Frage', value: question, inline: false },
        { name: '💬 Antwort', value: response.substring(0, 1024), inline: false }
      )
      .setTimestamp()
      .setFooter({ text: 'Sector X RP Server' });

    await interaction.editReply({ content: '', embeds: [embed] });
  } catch (error) {
    console.error('OpenAI Error:', error);
    await interaction.editReply({ content: '❌ Fehler bei der AI-Anfrage.' });
  }
}

export default { data, execute } as SlashCommand;
