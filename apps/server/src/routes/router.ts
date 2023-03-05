import { Router } from 'express';
import { youtubeRouter } from './youtube.routes';

const router: Router = Router();
router.use('/youtube', youtubeRouter);
export default router;
