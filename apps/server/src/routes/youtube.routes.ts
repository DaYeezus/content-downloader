import { Router } from 'express';
import {
  downloadAudioPlaylist,
  downloadAudio,
  getContentInfo,
  getPlaylistInfo,
  downloadVideo,
  downloadVideoPlaylist,
} from '../controllers/youtube.controller';

const router: Router = Router();

router.get('/content/:videoId', getContentInfo);
router.get('/video/download/:videoId', downloadVideo);
router.get('/audio/download/:videoId', downloadAudio);
router.get('/playlist/:playlistId', getPlaylistInfo);
router.get('/playlist/video/download/:playlistId', downloadVideoPlaylist);
router.get('/playlist/audio/download/:playlistId', downloadAudioPlaylist);
export { router as youtubeRouter };
