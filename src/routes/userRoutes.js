import { Router } from "express";
import { getCurrentUser, updateUserProfile } from "../controllers/userController.js";
import { authenticate } from "../middleware/authenticate.js";
//import { updateUserSchema } from "../validations/userValidation.js";
//import { celebrate } from "celebrate";
import { upload } from "../middleware/multer.js";


const router = Router();

router.get("/users/me", authenticate, getCurrentUser);

router.patch("/users/me", authenticate, upload.single("avatar"), updateUserProfile);

export default router
