require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const { RobloxUser } = require('./schema');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('clientReady', () => {
  console.log(`Discord bot logged in as ${client.user.tag}`);
});

// ---------------------------
// Shared setup logic
// ---------------------------
async function handleSetup(robloxName, discordId, reply) {
  if (!robloxName) {
    return reply('You must provide your Roblox username.');
  }

  try {
    const user = await RobloxUser.findOne({ username: robloxName });
    if (!user) {
      return reply(`The Roblox username **${robloxName}** has never joined the game.`);
    }

    if (user.uid) {
      return reply(`The Roblox username **${robloxName}** is already linked to a Discord account.`);
    }

    user.uid = discordId;
    await user.save();
    return reply(`Your Discord ID has been linked to Roblox username **${robloxName}**!`);
  } catch (err) {
    console.error('Error in setup:', err);
    return reply('Failed to link your Roblox username.');
  }
}

// ---------------------------
// Shared remove logic
// ---------------------------
async function handleRemove(discordId, reply) {
  try {
    const user = await RobloxUser.findOne({ uid: discordId });
    if (!user) {
      return reply('No Roblox username is linked to your Discord account.');
    }

    await RobloxUser.deleteOne({ uid: discordId });
    return reply(`Your data has been removed from the database.`);
  } catch (err) {
    console.error('Error in remove:', err);
    return reply('Failed to remove your data.');
  }
}

// ---------------------------
// Slash commands
// ---------------------------
const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Test command'),
  new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Link your Roblox username')
    .addStringOption(option =>
      option.setName('roblox')
        .setDescription('Your Roblox username')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Unlink and remove your Roblox username')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
(async () => {
  try {
    console.log('Registering slash commands...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('Slash commands registered');
  } catch (err) {
    console.error('Failed to register slash commands:', err);
  }
})();

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName } = interaction;

  if (commandName === 'ping') {
    await interaction.reply('Pong');
    return;
  }

  if (commandName === 'setup') {
    const robloxName = interaction.options.getString('roblox');
    const discordId = interaction.user.id;
    await handleSetup(robloxName, discordId, msg => interaction.reply(msg));
  }

  if (commandName === 'remove') {
    await handleRemove(interaction.user.id, msg => interaction.reply(msg));
  }
});

// ---------------------------
// Message commands
// ---------------------------
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;

  const [cmd, ...args] = message.content.slice(1).split(/\s+/);

  if (cmd.toLowerCase() === 'ping') {
    message.reply('Pong');
    return;
  }

  if (cmd.toLowerCase() === 'setup') {
    const robloxName = args[0];
    const discordId = message.author.id;
    await handleSetup(robloxName, discordId, msg => message.reply(msg));
  }

  if (cmd.toLowerCase() === 'remove') {
    await handleRemove(message.author.id, msg => message.reply(msg));
  }
});

client.login(process.env.DISCORD_TOKEN);
module.exports = client;