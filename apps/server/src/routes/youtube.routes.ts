import {Router} from 'express';
import {downloadFromPlaylist, downloadFromVideo, getContentInfo,} from '../controllers/youtube.controller';

const router: Router = Router();

router.post('/', getContentInfo);
router.post('/video', downloadFromVideo);
router.post('/playlist', downloadFromPlaylist);
export {router as youtubeRouter};
