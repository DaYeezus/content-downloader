'use strict';
exports.__esModule = true;
exports.playlistIdSchema =
  exports.videoIdSchema =
  exports.downloadContentFromPlaylistSchema =
  exports.downloadContentFromVideoSchema =
    void 0;
var zod_1 = require('zod');
var regexes_1 = require('./regexes');
exports.downloadContentFromVideoSchema = zod_1.z.object({
  isHighQuality: zod_1.z.string()['default']('true'),
});
exports.downloadContentFromPlaylistSchema = zod_1.z.object({
  isHighQuality: zod_1.z.string()['default']('true'),
  albumName: zod_1.z.string().max(12),
});
exports.videoIdSchema = zod_1.z.object({
  link: zod_1.z
    .string({
      required_error: 'Please insert the music link from youtube',
    })
    .regex(regexes_1.youtubeVideoRegex, 'invalid youtube video url')
    .transform(function (val) {
      return val.match(regexes_1.youtubeVideoRegex)[5];
    }),
});
exports.playlistIdSchema = zod_1.z.object({
  link: zod_1.z
    .string({
      required_error: 'Please insert the music link from youtube',
    })
    .regex(regexes_1.youtubePlaylistRegex, 'Invalid playlist url')
    .transform(function (val) {
      return val.match(regexes_1.youtubePlaylistRegex)[1];
    }),
});
