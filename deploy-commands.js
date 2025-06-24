const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const CLIENT_ID = 'PASTEAZA_AICI_CLIENT_ID';

const commands = [
    new SlashCommandBuilder()
        .setName('radio')
        .setDescription('Afișează frecvența actuală și permite schimbarea.')
        .toJSON()
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('🔁 Înregistrez comenzi slash...');
        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands }
        );
        console.log('✅ Comenzi înregistrate.');
    } catch (error) {
        console.error(error);
    }
})();