const Discord = require("discord.js");

module.exports = async function (
  /** @type {Discord.ModalSubmitInteraction} */ modal,
  /** @type {Discord.Snowflake} */ id
) {
  const reason = modal.fields.getTextInputValue("reason");
  const user = await modal.client.users.fetch(id).catch(() => null);
  const member = await modal.guild.members.fetch(id).catch(() => null);

  if (!reason) return modal.reply("You must provide a reason.");
  if (!user) return modal.reply("User not found.");
  if (!member)
    return modal.reply({
      content: "User not in the server, they might have left?",
      ephemeral: true,
    });

  const channel = await modal.guild.channels.fetch(process.env.VOTING_CHANNEL_ID).catch(v => v);

  if (!channel || channel.type !== Discord.ChannelType.GuildText)
    return modal.reply({
      content: `Vote channel not found. Contact an admin.\n\`\`\`\n${new Error(!channel.message ? "Channel is not of type GUILD_TEXT: " + Discord.ChannelType[channel.type] : channel.message)}\n\`\`\``,
      ephemeral: true,
    });

  const msg = await channel.send({
    content: `**${modal.user.tag}** wants to ban **${user.tag}** (${user.id}).`,
    components: [
      new Discord.ActionRowBuilder()
        .addComponents(
          new Discord.ButtonBuilder()
            .setEmoji("👍")
            .setCustomId("ban.yes")
            .setStyle(Discord.ButtonStyle.Secondary),
          new Discord.ButtonBuilder()
            .setEmoji("👎")
            .setCustomId("ban.no")
            .setStyle(Discord.ButtonStyle.Secondary)
        )
        .toJSON(),
    ],
    embeds: [
      {
        color: /* not quite orange, not quite yellow */ 0xffcc00,
        author: {
          icon_url: user.displayAvatarURL({ dynamic: true }),
          name: user.tag,
        },
        description: `>>> ${reason.trim()}`,
        footer: {
          text: `No votes yet... | ${user.id}`,
        },
      },
    ],
  });

  modal.reply({
    content: `Your request has been sent to the vote channel. [Jump!](${msg.url})`,
    ephemeral: true,
  });
};
