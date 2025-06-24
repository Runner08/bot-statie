require('dotenv').config();
const {
    Client,
    GatewayIntentBits,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
    Events,
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Salvăm frecvențele per mesaj
const frequencyMap = new Map();

client.once(Events.ClientReady, () => {
    console.log(`🟢 Botul este online ca ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
    // Slash command
    if (interaction.isChatInputCommand() && interaction.commandName === 'radio') {
        const embed = new EmbedBuilder()
            .setTitle('📡 Statie Comuna 📡')
            .setDescription(`======================

**Frecvența curentă:** \`-\`

======================`)
            .setColor(0x2b2d31);

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('change_freq')
                .setLabel('Schimbă frecvența')
                .setStyle(ButtonStyle.Primary),
        );

        const message = await interaction.reply({
            content: 'S-a făcut o nouă frecvență pentru 📡 **Statie Comuna** 📡!',
            embeds: [embed],
            components: [buttons],
            fetchReply: true
        });

        frequencyMap.set(message.id, '-');
    }

    // Buton: schimbă frecvența
    if (interaction.isButton() && interaction.customId === 'change_freq') {
        const modal = new ModalBuilder()
            .setCustomId(`freq_modal_${interaction.message.id}`)
            .setTitle('Schimbă frecvența');

        const input = new TextInputBuilder()
            .setCustomId('new_freq')
            .setLabel('Introdu frecvența nouă')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const row = new ActionRowBuilder().addComponents(input);
        modal.addComponents(row);

        await interaction.showModal(modal);
    }

    // Buton: anulare (șterge mesajul)
    if (interaction.isButton() && interaction.customId === 'cancel') {
        await interaction.message.delete().catch(() => {});
        await interaction.reply({ content: 'Mesaj șters.', ephemeral: true });
    }

    // Modal: trimite frecvență nouă
    if (interaction.isModalSubmit() && interaction.customId.startsWith('freq_modal_')) {
        const newFreq = interaction.fields.getTextInputValue('new_freq');
        const messageId = interaction.customId.split('_').pop();

        const original = await interaction.channel.messages.fetch(messageId).catch(() => null);
        if (!original) {
            return interaction.reply({ content: '❌ Mesajul nu a fost găsit.', ephemeral: true });
        }

        const oldFreq = frequencyMap.get(messageId) || '-';
        frequencyMap.set(messageId, newFreq);

        const now = new Date();
        const formattedTime = now.toLocaleString('ro-RO', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        const updatedEmbed = new EmbedBuilder()
            .setTitle('📡 Statie Comuna 📡')
            .setDescription(`======================

**Frecvența curentă:** \`${newFreq}\`

======================

${interaction.user.username} a schimbat statia la ${formattedTime}!

Frecvența anterioară: \`${oldFreq}\``)
            .setColor(0x2b2d31);

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('change_freq')
                .setLabel('Schimbă frecvența')
                .setStyle(ButtonStyle.Primary),
        );

        await original.edit({ embeds: [updatedEmbed], components: [buttons] });
        await interaction.reply({ content: '✅ Frecvență actualizată!', ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN);
