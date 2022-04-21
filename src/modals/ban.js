const Discord = require('discord.js');

module.exports = async function (
	/** @type {Discord.ModalSubmitInteraction} */ modal,
	/** @type {Discord.Snowflake} */ id
) {
	const reason = modal.fields.getTextInputValue('reason');
	const user = await modal.client.users.fetch(id).catch(() => null);
	const member = await modal.guild.members.fetch(id).catch(() => null);

	if (!reason) return modal.reply('You must provide a reason.');
	if (!user) return modal.reply('User not found.');
	if (!member)
		return modal.reply('User not in the server, they might have left?');

	const channel = await modal.guild.channels.cache.get(
		process.env.VOTING_CHANNEL_ID
	);

	if (!channel || channel.type !== Discord.ChannelType.GuildText)
		return modal.reply('Vote channel not found. Contact an admin.');

	await channel.send(
		`**${modal.user.tag}** (\`${modal.user.id}\`; ${modal.user}) wants to ban **${user.tag}** (\`${user.id}\`; ${user}):\n\n>>> ${reason}`
	);

	modal.reply(`Your request has been sent to the vote channel.`);
};
