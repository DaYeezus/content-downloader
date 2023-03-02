import {Router} from "express";
import {getContentInfo,} from "../controllers/youtube.controller";

const router: Router = Router();
router.post("/", getContentInfo);
export {router as youtubeRouter};
