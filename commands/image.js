var Scraper = require("images-scraper");
const google = new Scraper({
  puppeteer: {
    headless: true,
  },
});

module.exports = {
  name: "image",
  aliases: "i",
  description: "this sends an image to a discord channel",
  async execute(message, args, cmd, client, Discord) {
    const imageQuery = args.join(" ");
    if (!imageQuery)
      return message.channel.send({
        embed: {
          color: "RED",
          description: "❌ **Please enter an image name!**",
        },
      });

    const imageResults = await google.scrape(imageQuery, 100);
    const randomImage = imageResults[Math.floor(Math.random() * 100) + 1];
    message.channel.send(randomImage.url);
  },
};
