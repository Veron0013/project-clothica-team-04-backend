import { Router } from "express";
import { getCurrentUser, updateUserProfile } from "../controllers/userController.js";
import { upload } from "../middleware/multer.js";
import { authenticate } from "../middleware/authenticate.js";


const router = Router();

router.patch("/username/me", authenticate, upload.single("avatar"), updateUserProfile);
router.get("/username/me", authenticate, getCurrentUser);

export default router
