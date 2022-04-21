const Discord = require('discord.js');

module.exports = function (/** @type {Discord.CommandInteraction} */ command) {
	if (command.isChatInputCommand()) {
		const user = command.options.getUser('user', true);

		if (!command.options.getMember('user')) {
			return command.reply('User must be in the server.');
		}

		return command.showModal(
			new Discord.ModalBuilder()
				.setTitle(`Ban @${user.username} (${user.id})?`)
				.setCustomId('ban.' + user.id)
				.setComponents(
					// @ts-ignore
					new Discord.ActionRowBuilder().setComponents(
						new Discord.TextInputBuilder()
							.setCustomId('reason')
							.setPlaceholder('Reason')
							.setMaxLength(100)
							.setLabel('Reason')
							.setStyle(Discord.TextInputStyle.Paragraph)
							.setRequired(true)
					)
				)
				.toJSON()
		);
	}
};
