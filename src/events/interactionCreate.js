const Discord = require("discord.js");
const walk = require("../util/walk.js");
const modalSubmit = require("./modalSubmit.js");

const interactions = new Discord.Collection();

for (const [file, data] of walk(`${__dirname}/../commands`)) {
  interactions.set(file, data);
}

module.exports = async function (
  /** @type {Discord.Interaction} */ interaction
) {
  try {

  if (interaction.isCommand()) {
    const command = interaction.commandName;
    const interactionData = interactions.get(command);

    if (interactionData) {
      await interactionData(interaction);
    } else {
      await interaction.reply(
        "Command not found, this should never happen. Ping **@splatter.8999**."
      );
    }
  } else if (interaction.isModalSubmit()) {
    await modalSubmit(interaction);
  } else if (interaction.isMessageComponent()) {
    const [command, ...args] = interaction.customId.split(".");

    if (interactions.has(command)) {
      const interactionData = interactions.get(command);
      await interactionData.component(interaction, ...args);
    }
  }

  } catch (e) {
    await interaction.reply?.({
      content: `\`\`\`js\n${process.env.NODE_ENV === "development" ? e.stack ?? e : e.message ?? e}\n\`\`\``,
      ephemeral: true,
    });
  }
};
