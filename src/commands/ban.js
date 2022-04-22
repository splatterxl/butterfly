const Discord = require("discord.js");

module.exports = function (/** @type {Discord.CommandInteraction} */ command) {
  let user;

  if (command.isChatInputCommand()) {
    if (
      !command.memberPermissions.has(
        Discord.PermissionFlagsBits.ModerateMembers
      )
    ) {
      return command.reply({
        content: "Requires moderator permissions.",
        ephemeral: true,
      });
    }

    user = command.options.getUser("user", true);

    if (!command.options.getMember("user")) {
      return command.reply({
        content: "User must be in the server.",
        ephemeral: true,
      });
    }

    let member = command.options.getMember("user");

    if (!member.manageable) return command.reply({
      content: "Missing permissions",
      ephemeral: true
    })

    return command.showModal(
      new Discord.ModalBuilder()
        .setTitle(`Ban @${user.username} (${user.id})?`)
        .setCustomId("ban." + user.id)
        .setComponents(
          // @ts-ignore
          new Discord.ActionRowBuilder().setComponents(
            new Discord.TextInputBuilder()
              .setCustomId("reason")
              .setPlaceholder("Reason")
              .setMinLength(2)
              .setMaxLength(500)
              .setLabel("Reason")
              .setStyle(Discord.TextInputStyle.Paragraph)
              .setRequired(true)
          )
        )
        .toJSON()
    );
  }
};

module.exports.component = async function (
  /** @type {Discord.MessageComponentInteraction} */ interaction,
  /** @type {string} */ action,
  /** @type {string} */ mid
) {
  if (!mid) mid = interaction.message.id;

  const message = await interaction.channel.messages.fetch({
    message: mid,
    cache: true,
  });

  let isCoreStaff = interaction.memberPermissions.has(
    Discord.PermissionFlagsBits.BanMembers,
    true
  );

  function respondWithDropdown(/** @type {boolean} */ approve) {
    return interaction.reply({
      content: "How would you like to continue?",
      components: [
        new Discord.ActionRowBuilder()
          .addComponents(
            new Discord.ButtonBuilder()
              .setCustomId(
                `ban.${approve ? "approve" : "veto"}.${interaction.message.id}`
              )
              .setLabel(approve ? "Approve" : "Veto")
              .setStyle(
                approve
                  ? Discord.ButtonStyle.Success
                  : Discord.ButtonStyle.Danger
              ),
            new Discord.ButtonBuilder()
              .setCustomId(
                `ban.${approve ? "+" : "-"}1.${interaction.message.id}`
              )
              .setLabel(approve ? "Upvote" : "Downvote")
              .setStyle(Discord.ButtonStyle.Secondary)
          )
          .toJSON(),
      ],
      ephemeral: true,
    });
  }

  if (!message.components[0]?.components.length)
    return interaction.deferUpdate();

  switch (action) {
    case "yes":
      if (isCoreStaff) return respondWithDropdown(true);
    case "+1": {
      const embed = new Discord.EmbedBuilder(message.embeds[0].data);
        const votes = prepareVote("up", embed.data, interaction.user.id);
        embed.setFooter(votes.footer);
        embed.setFields(...votes.fields);

        await interaction.deferUpdate();
        await message.edit({
          embeds: [embed.toJSON()],
        });

      break;
    }
    case "no":
      if (isCoreStaff) return respondWithDropdown(false);
    case "-1": {
      const embed = new Discord.EmbedBuilder(message.embeds[0].data);
        const votes = prepareVote("down", embed.data, interaction.user.id);
        embed.setFooter(votes.footer);
        embed.setFields(...votes.fields);

        await interaction.deferUpdate();
        await message.edit({
          embeds: [embed.toJSON()],
        });

      break;
    }
    case "approve": {
      if (!isCoreStaff) {
        interaction.reply({
          content: "I don't think you're meant to have this button... 🤨",
          ephemeral: true,
        });
        break;
      } 

      if (message.components[0]?.components[0]?.label?.includes("Vetoed")) return interaction.deferUpdate();

      let reason = message.embeds[0].description;
      let user = message.embeds[0].footer.text.split("| ")[1];

      let member = await interaction.guild.members.fetch(user);

      if (!member.bannable) {
        // @ts-ignore
        return interaction.reply({
          content: "I can't ban that user.",
          ephemeral: true,
        });
      }

      await member.ban({
        reason: `${reason.slice(4) /* ">>> " */} \n\n— see case ${
          interaction.message.id
        }`,
      });

      await interaction.deferUpdate();

      await message.edit?.({
        components: [
          new Discord.ActionRowBuilder()
            .addComponents(
              new Discord.ButtonBuilder()
                .setCustomId("ban.unban." + mid)
                .setLabel(`Approved by ${interaction.user.tag}`)
                .setStyle(Discord.ButtonStyle.Secondary)
            )
            .toJSON(),
        ],
      });
      await message.reply({
        content: `Banned **${member.user.tag}**`,
        ephemeral: true,
      });

      await interaction.message.edit?.({
        components: [
          new Discord.ActionRowBuilder()
            .addComponents(
              new Discord.ButtonBuilder()
                .setCustomId("ban.unban." + mid)
                .setLabel(`Undo`)
                .setStyle(Discord.ButtonStyle.Secondary)
            )
            .toJSON(),
        ],
      });

      break;
    }
    case "veto": {
      if (!isCoreStaff)
        return interaction.reply({
          content: "I don't think you're meant to have this button... 🤨",
          ephemeral: true,
        });

      if (message.components[0]?.components[0]?.label?.includes("Vetoed")) return interaction.deferUpdate();

      await interaction.deferUpdate();

      await message.edit?.({
        components: [
          new Discord.ActionRowBuilder()
            .setComponents(
              new Discord.ButtonBuilder()
                .setCustomId("ban.___ignore")
                .setLabel(`Vetoed by ${interaction.user.tag}`)
                .setStyle(Discord.ButtonStyle.Danger)
                .setDisabled(true)
            )
            .toJSON(),
        ],
      });

      break;
    }
    case "___ignore":
      break;
    case "unban": {
      if (!isCoreStaff)
        return interaction.reply({
          content: "Only core staff can unban users.",
          ephemeral: true,
        });

      const user = message.embeds[0].footer.text.split("| ")[1];

      const ban = await interaction.guild.bans.fetch(user).catch(() => null);

      if (!ban) {
        return interaction.reply({
          content: "That user isn't actually banned.",
          ephemeral: true,
        });
      }

      try {
        await interaction.guild.members.unban(
          user,
          `Unban of case ${message.id} by ${interaction.user.tag}.`
        );
      } catch (e) {
        return interaction.reply({
          content: e.message,
          ephemeral: true,
        });
      }

      await interaction.deferUpdate();
      await message.edit({
        components: [
          new Discord.ActionRowBuilder()
            .setComponents(
              new Discord.ButtonBuilder()
                .setCustomId("ban.___ignore")
                .setLabel(`Unbanned by ${interaction.user.tag}`)
                .setStyle(Discord.ButtonStyle.Secondary)
                .setDisabled(true)
            )
            .toJSON(),
        ],
      });
    }
  }
};

/**
 * @param {Discord.EmbedData} text
 */
function prepareVote(dir = "up", text, userId) {
  const [votes, user] = text.footer.text.split(" | ");

  if (votes === "No votes yet...")
    return {
      footer: {
        text: `${dir === "up" ? "up: 1, down: 0" : "up: 0, down: 1"} | ${user}`,
      },
      fields: [
        {
          name: "Voters",
          value: generateVotes({ [dir]: [userId] }),
        },
      ],
    };

  // text.fields[0].value: "+1: 123456789, 348981\n-1: 123456789, 348981"
  const [up = [], down = []] = text.fields[0].value
    .split("\n")
    .map((v) => v.split(": ")[1].split(", "));

  const alreadyCasted = getVoteForUser({ up, down }, userId);

  if (alreadyCasted === dir) return text;

  let data = { up, down };

  data[dir].push(userId);

  if (alreadyCasted) data[not(dir)] = data[not(dir)].filter(v => v !== userId);

  return {
    footer: {
      text: `up: ${data.up?.length ?? 0}, down: ${data.down?.length ?? 0} | ${user}`,
    },
    fields: [
      {
        name: "Voters",
        value: generateVotes(data),
      },
    ],
  };
}

// given { up: [123456789], down: [123456789] },
// return "+1: 123456789\n-1: 123456789"
function generateVotes(votes) {
  return `${votes.up?.length ? `+1: ${votes.up.join(", ")}\n` : ""}${
    votes.down?.length ? `-1: ${votes.down.join(", ")}` : ""
  }`;
}

// given `data` { up: [123456789], down: [348981] },
// and `user` 123456789, return "up"
function getVoteForUser(data, u) {
  return Object.entries(data).filter(([, v]) => v?.includes(u)).map(([k]) => k)[0]
}

const not = dir => dir === "up" ? "down" : "up";
