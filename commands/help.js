module.exports = {
  name: "help",
  description: "List of commands",
  async execute(message) {
    message.channel.send({
      embed: {
        color: "GREEN",
        author: { name: "Help" },
        fields: [
          {
            name: "Bot",
            value:
              "`!clear` clear messages by entering a value (e.g. !clear 10)\n `!image` search for an image (e.g. !image Iron man)\n `!help ` display a list of all bot commands",
          },
          {
            name: "Music",
            value:
              "`!play ` play music by entering keywords or a url link\n `!pause` pause the current song\n `!resume` resume playing the current paused song\n `!skip ` skip the current song and play the next song in queue\n `!stop ` stop the bot entirely and clear the queue of songs",
          },
        ],
        description: "This is the list of commands the bot can perform.",
      },
    });
  },
};
