import express, { Router } from "express";
import { downloadPlaylist } from "../controllers/youtube.controller";

const router: Router = Router();
router.get("/", downloadPlaylist);
export { router as youtubeRouter };
