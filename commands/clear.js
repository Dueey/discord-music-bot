module.exports = {
  name: "clear",
  aliases: "cl",
  description: "Clears messages",
  async execute(message, args, cmd, client, Discord) {
    if (!args[0])
      return message.reply({
        embed: {
          color: "RED",
          description:
            "❌ **Please enter the amount of messages that you want to clear!**",
        },
      });

    if (isNaN(args[0]))
      return message.reply({
        embed: {
          color: "RED",
          description: "❌ **Please enter a real number!**",
        },
      });

    if (args[0] > 100)
      return message.reply({
        embed: {
          color: "RED",
          description: "❌ **You cannot delete more than 100 messages!**",
        },
      });

    if (args[0] < 1)
      return message.reply({
        embed: {
          color: "RED",
          description: "❌ **You must delete at least one message!**",
        },
      });

    await message.channel.messages
      .fetch({ limit: args[0] })
      .then((messages) => {
        message.channel.bulkDelete(messages);
      });
  },
};
