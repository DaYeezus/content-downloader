import express, { Router } from "express";
import {
  downloadContent,
  getContentInfo,
} from "../controllers/youtube.controller";

const router: Router = Router();
router.get("/:link", getContentInfo);
router.post("/", downloadContent);
export { router as youtubeRouter };
