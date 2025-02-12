const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { success } = require('../../utils/emojis.json');
const { oneLine } = require('common-tags');

module.exports = class SetMessageXPCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'setmessagexp',
      aliases: ['setmsgxp', 'setmxp', 'smxp'],
      usage: 'setmessagexp <xp>',
      description: oneLine`
          Sets the amount of xp a user gets when they send a message.
          The default is 1.
          The maximum xp per message is equal to the xp plus 2. (If xp is 5, the max is 7)
          The minimum xp per message is equal to the xp minus 2. (If xp is 5, the min is 3 and if xp is 2 or less, the min is 0)
          `,
      type: client.types.ADMIN,
      userPermissions: ['MANAGE_GUILD'],
      examples: ['setmessagexp 5']
    });
  }
  run(message, args) {
    let amount = args[0];
    if (!amount || !Number.isInteger(Number(amount)) || amount < 0) 
      return this.sendErrorMessage(message, 0, 'Please enter a positive integer.');
    amount = Math.floor(amount);
    const {
      xp_tracking: xpTracking, message_xp: xpMessages, command_xp: xpCommands, voice_xp: xpVoice
    } = message.client.db.settings.selectXP.get(message.guild.id);

    let old_minimum = Math.floor(xpMessages - 2);
    if (old_minimum < 0) old_minimum = 0;
    let old_maximum = Math.floor(xpMessages + 2);

    let new_minimum = Math.floor(amount - 2);
    if (new_minimum < 0) new_minimum = 0;
    let new_maximum = Math.floor(amount + 2);

    let minimum_xp_command = Math.floor(xpCommands - 2);
    if (minimum_xp_command < 0) minimum_xp_command = 0;
    let maximum_xp_command = Math.floor(xpCommands + 2);

    let minimum_xp_voice = Math.floor(xpVoice - 2);
    if (minimum_xp_voice < 0) minimum_xp_voice = 0;
    let maximum_xp_voice = Math.floor(xpVoice + 2);


    const status = message.client.utils.getStatus(xpTracking);
    message.client.db.settings.updateMessageXP.run(amount, message.guild.id);
    const embed = new MessageEmbed()
      .setTitle('Settings: `XP`')
      .setThumbnail(message.guild.iconURL({ dynamic: true }))
      .setDescription(`The \`message XP\` value was successfully updated. ${success}`)
      .addField("Message XP", `\`Minimum: ${old_minimum}\` - \`Maximum: ${old_maximum}\` ➔ \`Minimum: ${new_minimum}\` - \`Maximum: ${new_maximum}\``)
      .addField('Command XP', `\`Minimum: ${minimum_xp_command}\` - \`Maximum: ${maximum_xp_command}\``)
      .addField('Voice XP', `\`Minimum: ${minimum_xp_voice}\` - \`Maximum: ${maximum_xp_voice}\``)
      .addField('Status', status)
      .setFooter({text: message.member.displayName, iconURL: message.author.displayAvatarURL({ dynamic: true })})
      .setTimestamp()
      .setColor(message.guild.me.displayHexColor);
    message.channel.send({embeds : [embed]});
  }
};
