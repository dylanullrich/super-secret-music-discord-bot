const { SlashCommandBuilder } = require('discord.js');

const ytdl = require('ytdl-core');
const {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  AudioPlayerStatus,
  VoiceConnectionStatus,
} = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play your desired YouTube audio content!')
    .addStringOption((option) =>
      option
        .setName('youtube-link')
        .setDescription('Enter a youtube link')
        .setRequired(true),
    ),
  async execute(interaction) {
    const url = interaction.options.getString('youtube-link');

    const connection = joinVoiceChannel({
      channelId: interaction.member.voice.channel.id,
      guildId: interaction.member.guild.id,
      adapterCreator:
        interaction.member.voice.channel.guild.voiceAdapterCreator,
      selfDeaf: false,
    });

    var stream = ytdl(url, { highWaterMark: 1 << 25, filter: 'audioonly' });
    const player = createAudioPlayer();

    const resource = createAudioResource(stream, {
      inputType: StreamType.Opus,
    });

    connection.on(VoiceConnectionStatus.Ready, () => {
      console.log(
        'The connection has entered the Ready state - ready to play audio!',
      );
    });
    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });
  },
};
