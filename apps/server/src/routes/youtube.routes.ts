import { Router } from "express";
import {downloadContent, getContentInfo} from "../controllers/youtube.controller";

const router: Router = Router();

router.post("/", getContentInfo);
router.post("/download", downloadContent);
export { router as youtubeRouter };
