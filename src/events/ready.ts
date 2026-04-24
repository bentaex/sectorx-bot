import { Client, EmbedBuilder } from 'discord.js';

export default function ready(client: Client) {
  console.log(`✅ Sector X Bot logged in as ${client.user?.tag}`);
  console.log(`📊 Serving ${client.guilds.cache.size} servers`);
  
  client.user?.setActivity({
    name: '/help | Sector X RP',
    type: 2, // LISTENING
  });
}
