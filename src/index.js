const dotenv = require("dotenv");
const Discord = require("discord.js");
const {
  IntentsBitField: { Flags: IntentFlags },
} = Discord;
const walk = require("./util/walk");

dotenv.config();

const client = new Discord.Client({
  intents:
    IntentFlags.Guilds | IntentFlags.GuildMessages | IntentFlags.MessageContent,
  allowedMentions: {
    parse: [],
  },
  presence: {
    status: "afk",
  },
});

for (const [file, data] of walk(`${__dirname}/events`)) {
  client.on(file, data);
}

client.on(
  "debug",
  process.env.NODE_ENV === "development" ? console.log : () => {}
);
client.on("error", console.error);
client.on("warn", console.warn);

const req = client.rest.request.bind(client.rest);

if (process.env.NODE_ENV === "development") {
  client.rest.request = async (options) => {
    console.log(require("util").inspect(options, false, null, true));
    const res = await req(options);
    return res;
  };
}

client.login(process.env.DISCORD_TOKEN);
