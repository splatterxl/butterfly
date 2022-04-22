const Discord = require("discord.js");
const walk = require("../util/walk.js");

const modals = new Discord.Collection();

for (const [file, data] of walk(`${__dirname}/../modals`)) {
  modals.set(file, data);
}

module.exports = function (
  /** @type {Discord.ModalSubmitInteraction} */ modal
) {
  const [command, ...args] = modal.customId.split(".");

  if (modals.has(command)) {
    modals.get(command)(modal, ...args);
  } else {
    modal.reply(
      "Modal handler not found, this should never happen. Ping **@Splatterxl#8999**."
    );
  }
};
