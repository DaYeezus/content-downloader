"use strict";
exports.__esModule = true;
exports.youtubePlaylistRegex = exports.youtubeVideoRegex = void 0;
exports.youtubeVideoRegex = /^(https?:\/\/)?(www\.)?youtu(\.be\/|be\.com\/(embed\/|v\/|watch\?v=))([\w\-]{11})(\S+)?$/;
exports.youtubePlaylistRegex = /^(?:https?:\/\/)?(?:www\.|m\.)?youtu(?:be\.com|\.be)\/playlist\?list=([\w-]+)/;
