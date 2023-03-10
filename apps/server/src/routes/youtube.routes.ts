import { Router } from 'express';
import {
  downloadFromPlaylist,
  downloadFromVideo,
  getContentInfo,
  getPlaylistInfo,
} from '../controllers/youtube.controller';

const router: Router = Router();

router.get('/video/:videoId', getContentInfo);
router.get('/video/download/:videoId', downloadFromVideo);
router.get('/playlist/:playlistId', getPlaylistInfo);
router.get('/playlist/download/:playlistId', downloadFromPlaylist);
export { router as youtubeRouter };
