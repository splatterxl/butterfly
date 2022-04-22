const Discord = require("discord.js");
const walk = require("../util/walk.js");

const modals = new Discord.Collection();

for (const [file, data] of walk(`${__dirname}/../modals`)) {
  modals.set(file, data);
}

module.exports = async function (
  /** @type {Discord.ModalSubmitInteraction} */ modal
) {
  const [command, ...args] = modal.customId.split(".");

  try {

  if (modals.has(command)) {
    await modals.get(command)(modal, ...args);
  } else {
    await modal.reply(
      "Modal handler not found, this should never happen. Ping **@Splatterxl#8999**."
    );
  }

  } catch (e) {
    await modal.reply({
      content: `\`\`\`js\n${process.env.NODE_ENV === "development" ? e.stack ?? e : e.message ?? e}\n\`\`\``,
      ephemeral: true,
    });
  }
};
