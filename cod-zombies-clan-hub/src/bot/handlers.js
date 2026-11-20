const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const db = require('../db');

// Handle Map Autocomplete
async function handleAutocomplete(interaction) {
  const focusedOption = interaction.options.getFocused(true);

  if (focusedOption.name === 'map') {
    const selectedGame = interaction.options.getString('game');
    const selectedFranchise = interaction.options.getString('franchise');
    let mapList = [];

    if (selectedGame) {
      mapList = db.getMapsForGame(selectedGame).map(m => m.name);
    } else {
      mapList = db.getAllMaps(selectedFranchise).map(m => `${m.name} (${m.short_code})`);
    }

    const filtered = mapList
      .filter(name => name.toLowerCase().includes(focusedOption.value.toLowerCase()))
      .slice(0, 25);

    await interaction.respond(
      filtered.map(choice => ({ name: choice, value: choice }))
    );
  }
}

// Handle Slash Commands
async function handleChatInputCommand(interaction, client) {
  const { commandName } = interaction;

  if (commandName === 'submit-round') {
    await handleRoundSubmission(interaction, client);
  } else if (commandName === 'leaderboard') {
    await handleViewLeaderboard(interaction);
  } else if (commandName === 'pending') {
    await handleViewPending(interaction);
  } else if (commandName === 'clan-stats') {
    await handleViewClanStats(interaction);
  } else if (commandName === 'add-map') {
    await handleAddMap(interaction);
  }
}

// 1. Submit Run (CoD / Halo / Gears)
async function handleRoundSubmission(interaction, client) {
  await interaction.deferReply({ ephemeral: true });

  const franchise_id = interaction.options.getString('franchise') || 'cod';
  const game_id = interaction.options.getString('game');
  let map_name = interaction.options.getString('map');
  if (map_name.includes('(')) {
    map_name = map_name.split('(')[0].trim();
  }

  const round = interaction.options.getInteger('score');
  const player_count = interaction.options.getString('players');
  const game_mode = interaction.options.getString('mode') || 'Standard';
  const player_name = interaction.options.getString('gamertag');
  const proof_url = interaction.options.getString('proof');
  const teammates = interaction.options.getString('teammates') || null;
  const twitch_channel = interaction.options.getString('twitch') || null;

  // Insert to DB as pending
  const submissionId = db.createSubmission({
    franchise_id,
    game_id,
    map_name,
    player_count,
    game_mode,
    round,
    player_name,
    discord_user_id: interaction.user.id,
    teammates,
    proof_url,
    twitch_channel,
    status: 'pending'
  });

  const submission = db.getSubmissionById(submissionId);
  const metric = submission.metric_label || 'Round';

  // Send ephemeral confirmation to user
  const confirmEmbed = new EmbedBuilder()
    .setTitle(`🎮 ${submission.franchise_name} [${submission.sub_label}] Submitted!`)
    .setColor(0x00FF9D)
    .setDescription(`Your **${metric} ${round}** run on **${map_name}** (${submission.game_name}) has been submitted for clan verification.`)
    .addFields(
      { name: 'Player', value: player_name, inline: true },
      { name: 'Category', value: player_count, inline: true },
      { name: metric, value: `${round}`, inline: true },
      { name: 'Mode / Ruleset', value: game_mode, inline: true },
      { name: 'Proof Link', value: proof_url }
    )
    .setFooter({ text: `Submission ID: #${submissionId} • A clan mod will review this soon.` })
    .setTimestamp();

  await interaction.editReply({ embeds: [confirmEmbed] });

  // Post to Admin Review Channel if configured
  const reviewChannelId = process.env.ADMIN_CHANNEL_ID;
  if (reviewChannelId) {
    try {
      const channel = await client.channels.fetch(reviewChannelId);
      if (channel) {
        const reviewEmbed = new EmbedBuilder()
          .setTitle(`🚨 New Clan Record Submission (#${submissionId})`)
          .setColor(0xFFA500)
          .setDescription(`**Submitted by:** <@${interaction.user.id}> (${interaction.user.tag})`)
          .addFields(
            { name: 'Franchise & Title', value: `${submission.franchise_name} [${submission.sub_label}] — **${submission.game_name}**`, inline: true },
            { name: 'Map', value: `**${map_name}**`, inline: true },
            { name: metric, value: `**${round}**`, inline: true },
            { name: 'Category', value: player_count, inline: true },
            { name: 'Gamertag', value: player_name, inline: true },
            { name: 'Teammates', value: teammates || 'None (Solo)', inline: true },
            { name: 'Twitch', value: twitch_channel || 'Not provided', inline: true },
            { name: 'Proof URL', value: proof_url }
          )
          .setFooter({ text: `ID: ${submissionId}` })
          .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`approve_${submissionId}`)
            .setLabel('Approve ✅')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId(`reject_${submissionId}`)
            .setLabel('Reject ❌')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setLabel('Watch Proof 📺')
            .setStyle(ButtonStyle.Link)
            .setURL(proof_url.startsWith('http') ? proof_url : `https://${proof_url}`)
        );

        await channel.send({ embeds: [reviewEmbed], components: [row] });
      }
    } catch (err) {
      console.error('Error posting to admin review channel:', err.message);
    }
  }
}

// 2. View Leaderboard
async function handleViewLeaderboard(interaction) {
  await interaction.deferReply();

  const franchise_id = interaction.options.getString('franchise');
  let map_name = interaction.options.getString('map');
  if (map_name && map_name.includes('(')) {
    map_name = map_name.split('(')[0].trim();
  }
  const player_count = interaction.options.getString('players');

  const records = db.getLeaderboard({
    franchise_id,
    map_name,
    player_count,
    limit: 10
  });

  const titleFilters = [
    franchise_id ? franchise_id.toUpperCase() : 'All Franchises',
    map_name || 'All Maps',
    player_count || 'All Teams'
  ].join(' • ');

  const embed = new EmbedBuilder()
    .setTitle(`🏆 Clan Leaderboard — ${titleFilters}`)
    .setColor(0xE50914)
    .setTimestamp();

  if (records.length === 0) {
    embed.setDescription('No approved high scores found for these filters. Be the first to submit one with `/submit-round`!');
  } else {
    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    const lines = records.map((rec, i) => {
      const medal = medals[i] || `#${i + 1}`;
      const metric = rec.metric_label || 'Round';
      let line = `${medal} **${metric} ${rec.round}** — **${rec.player_name}** (${rec.map_name} • ${rec.short_code})`;
      if (rec.proof_url) {
        line += ` • [Proof](${rec.proof_url})`;
      }
      return line;
    });

    embed.setDescription(lines.join('\n\n'));
    embed.setFooter({ text: `Showing top ${records.length} runs • Visit clan website for full rankings` });
  }

  await interaction.editReply({ embeds: [embed] });
}

// 3. View Pending (Admin)
async function handleViewPending(interaction) {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
    return interaction.reply({ content: '❌ You must have Manage Server permissions to view the pending approval queue.', ephemeral: true });
  }

  const pending = db.getPendingSubmissions(5);

  if (pending.length === 0) {
    return interaction.reply({ content: '🎉 No pending submissions! The leaderboard is completely up to date.', ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });

  const embed = new EmbedBuilder()
    .setTitle('📋 Pending Submission Queue')
    .setColor(0xFFA500)
    .setDescription(`Found **${pending.length}** submissions awaiting review:`);

  for (const item of pending) {
    embed.addFields({
      name: `#${item.id} — ${item.metric_label || 'Score'} ${item.round} on ${item.map_name} (${item.franchise_name})`,
      value: `**Player:** ${item.player_name} | **Category:** ${item.player_count}\n**Proof:** ${item.proof_url}`
    });
  }

  await interaction.editReply({ embeds: [embed] });
}

// 4. View Clan Stats
async function handleViewClanStats(interaction) {
  const stats = db.getClanStats();

  const embed = new EmbedBuilder()
    .setTitle('🛡️ Clan PvE Survival Record Book')
    .setColor(0x00FF9D)
    .setDescription('Tracked across Call of Duty [Zombies], Halo [Firefight], and Gears of War [Horde].')
    .setTimestamp();

  if (stats.franchises) {
    for (const f of stats.franchises) {
      embed.addFields({
        name: `${f.name} [${f.sub_label}]`,
        value: `**Record:** ${f.max_score > 0 ? `${f.metric_label} ${f.max_score}` : 'None yet'} | **Verified Runs:** ${f.run_count}`,
        inline: true
      });
    }
  }

  await interaction.reply({ embeds: [embed] });
}

// 5. Add Map (Admin)
async function handleAddMap(interaction) {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
    return interaction.reply({ content: '❌ Only clan admins or moderators can add maps.', ephemeral: true });
  }

  const game_id = interaction.options.getString('game');
  const name = interaction.options.getString('name');

  try {
    db.addMap(game_id, name);
    await interaction.reply({
      content: `✅ Successfully added map **${name}** to **${game_id.toUpperCase()}**! It is now instantly available in Discord autocomplete and on the web hub.`,
      ephemeral: false
    });
  } catch (err) {
    await interaction.reply({ content: `❌ Error adding map: ${err.message}`, ephemeral: true });
  }
}

// Handle Button Clicks (Approve / Reject)
async function handleButton(interaction, client) {
  const { customId, user } = interaction;

  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
    return interaction.reply({ content: '❌ Only clan admins or moderators can approve/reject runs.', ephemeral: true });
  }

  if (customId.startsWith('approve_') || customId.startsWith('reject_')) {
    const action = customId.startsWith('approve_') ? 'approved' : 'rejected';
    const submissionId = customId.split('_')[1];

    const submission = db.getSubmissionById(submissionId);
    if (!submission) {
      return interaction.reply({ content: '❌ Submission not found or already processed.', ephemeral: true });
    }

    db.updateSubmissionStatus(submissionId, action, user.tag);

    const isApproved = action === 'approved';
    const statusColor = isApproved ? 0x00FF9D : 0xFF0055;
    const statusText = isApproved ? 'APPROVED ✅' : 'REJECTED ❌';

    const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
      .setColor(statusColor)
      .setTitle(`[${statusText}] Submission #${submissionId}`)
      .spliceFields(0, 0, {
        name: 'Review Status',
        value: `${statusText} by <@${user.id}> at <t:${Math.floor(Date.now() / 1000)}:R>`
      });

    await interaction.update({
      embeds: [updatedEmbed],
      components: []
    });

    // Public announcement
    if (isApproved && process.env.PUBLIC_ANNOUNCE_CHANNEL_ID) {
      try {
        const publicChannel = await client.channels.fetch(process.env.PUBLIC_ANNOUNCE_CHANNEL_ID);
        if (publicChannel) {
          const metric = submission.metric_label || 'Round';
          const announceEmbed = new EmbedBuilder()
            .setTitle(`🎉 NEW CLAN RECORD VERIFIED!`)
            .setColor(0xE50914)
            .setDescription(`Congrats to **${submission.player_name}** for reaching **${metric} ${submission.round}** on **${submission.map_name}** (${submission.franchise_name} - ${submission.short_code})!`)
            .addFields(
              { name: 'Category', value: submission.player_count, inline: true },
              { name: metric, value: `${submission.round}`, inline: true }
            );

          if (submission.proof_url) {
            announceEmbed.addFields({ name: 'Watch the Run', value: `[Proof Link](${submission.proof_url})` });
          }

          await publicChannel.send({ embeds: [announceEmbed] });
        }
      } catch (err) {
        console.error('Error posting public announcement:', err.message);
      }
    }
  }
}

module.exports = {
  handleAutocomplete,
  handleChatInputCommand,
  handleButton
};
