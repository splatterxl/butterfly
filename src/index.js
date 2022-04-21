const dotenv = require('dotenv');
const Discord = require('discord.js');
const {
	IntentsBitField: { Flags: IntentFlags }
} = Discord;
const walk = require('./util/walk');

dotenv.config();

const client = new Discord.Client({
	intents:
		IntentFlags.Guilds | IntentFlags.GuildMessages | IntentFlags.MessageContent,
	allowedMentions: {
		parse: []
	},
	presence: {
		status: 'invisible'
	}
});

for (const [file, data] of walk(`${__dirname}/events`)) {
	client.on(file, data);
}

client.login(process.env.DISCORD_TOKEN);
