import { authenticate, authorize } from "../middleware/auth";
import { UserRole } from "../models/User";
// import router from "../router";
import { AdminDashBoard } from "../controllers/loanController";
import { Router } from "express";


const router = Router();

router.use(authenticate);

router.get('/dashboard', authorize(UserRole.ADMIN), AdminDashBoard);


export default router;