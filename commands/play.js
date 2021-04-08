const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");

const queue = new Map();

module.exports = {
  name: "play",
  aliases: ["skip", "stop", "pause", "resume"],
  cooldown: 0,
  description: "Advanced Music Bot",
  async execute(message, args, cmd, client, Discord) {
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel)
      return message.channel.send({
        embed: {
          color: "RED",
          description:
            "❌ **You need to be in a channel to execute this command!**",
        },
      });
    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT"))
      return message.channel.send({
        embed: {
          color: "RED",
          description: "❌ **You do not have the correct permissions!**",
        },
      });
    if (!permissions.has("SPEAK"))
      return message.channel.send({
        embed: {
          color: "RED",
          description: "❌ **You do not have the correct permissions!**",
        },
      });

    const serverQueue = queue.get(message.guild.id);

    if (cmd === "play") {
      if (!args.length)
        return message.channel.send({
          embed: {
            color: "RED",
            description: "❌ **You need to send the second argument!**",
          },
        });
      let song = {};

      if (ytdl.validateURL(args[0])) {
        const songInfo = await ytdl.getInfo(args[0]);
        song = {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
        };
      } else {
        const videoFinder = async (query) => {
          const videoResult = await ytSearch(query);
          return videoResult.videos.length > 1 ? videoResult.videos[0] : null;
        };

        const video = await videoFinder(args.join(" "));
        if (video) {
          song = { title: video.title, url: video.url };
        } else {
          message.channel.send({
            embed: {
              color: "RED",
              description: "❌ **Error finding video.**",
            },
          });
          return;
        }
      }

      if (!serverQueue) {
        const queueConstructor = {
          voiceChannel: voiceChannel,
          textChannel: message.channel,
          connection: null,
          songs: [],
        };

        queue.set(message.guild.id, queueConstructor);
        queueConstructor.songs.push(song);

        try {
          const connection = await voiceChannel.join();
          queueConstructor.connection = connection;
          videoPlayer(message.guild, queueConstructor.songs[0]);
        } catch (err) {
          queue.delete(message.guild.id);
          message.channel.send({
            embed: {
              color: "RED",
              description: "❌ **There was an error connecting!**",
            },
          });
          throw err;
        }
      } else {
        serverQueue.songs.push(song);
        return message.channel.send({
          embed: {
            color: "BLUE",
            description: `🎵 __**${song.title}**__ added to queue!`,
          },
        });
      }
    } else if (cmd === "skip") skipSong(message, serverQueue);
    else if (cmd === "stop") stopSong(message, serverQueue);
    else if (cmd === "pause") pauseSong(message, serverQueue);
    else if (cmd === "resume") resumeSong(message, serverQueue);
  },
};

const videoPlayer = async (guild, song) => {
  const songQueue = queue.get(guild.id);
  if (!song) {
    songQueue.voiceChannel.leave();
    queue.delete(guild.id);
    songQueue.textChannel.send({
      embed: {
        color: "RED",
        description: "❌ **No more music to play! See you next time!**",
      },
    });
    return;
  }
  const stream = ytdl(song.url, { filter: "audioonly" });
  songQueue.connection
    .play(stream, { seek: 0, volume: 0.5 })
    .on("finish", () => {
      songQueue.songs.shift();
      videoPlayer(guild, songQueue.songs[0]);
    });
  await songQueue.textChannel.send({
    embed: {
      color: "BLUE",
      description: `🎶 Now playing __**${song.title}**__`,
    },
  });
};

const skipSong = (message, serverQueue) => {
  if (!message.member.voice.channel)
    return message.channel.send({
      embed: {
        color: "RED",
        description:
          "❌ **You need to be in a channel to execute this command!**",
      },
    });
  if (!serverQueue) {
    return message.channel.send({
      embed: {
        color: "RED",
        description: "❌ **There are no songs in queue!**",
      },
    });
  }
  serverQueue.connection.dispatcher.end();
};

const stopSong = (message, serverQueue) => {
  if (!message.member.voice.channel)
    return message.channel.send({
      embed: {
        color: "RED",
        description:
          "❌ **You need to be in a channel to execute this command!**",
      },
    });
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
};

const pauseSong = (message, serverQueue) => {
  if (!message.member.voice.channel)
    return message.channel.send({
      embed: {
        color: "RED",
        description:
          "❌ **You need to be in a channel to execute this command!**",
      },
    });
  if (serverQueue.connection.dispatcher.paused)
    return message.channel.send({
      embed: {
        color: "RED",
        description: "❌ **Song is already paused!**",
      },
    });
  serverQueue.connection.dispatcher.pause();
  message.channel.send({
    embed: {
      color: "BLUE",
      description: "⏸ **Paused the song!**",
    },
  });
};

const resumeSong = (message, serverQueue) => {
  if (!message.member.voice.channel)
    return message.channel.send({
      embed: {
        color: "RED",
        description:
          "❌ **You need to be in a channel to execute this command!**",
      },
    });
  if (!serverQueue.connection.dispatcher.paused)
    return message.channel.send({
      embed: {
        color: "RED",
        description: "❌ **Song isn't paused!**",
      },
    });
  serverQueue.connection.dispatcher.resume();
  message.channel.send({
    embed: {
      color: "BLUE",
      description: "▶ **Resuming the song!**",
    },
  });
};
