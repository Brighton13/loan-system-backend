"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
// import router from "../router";
const loanController_1 = require("../controllers/loanController");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/dashboard', (0, auth_1.authorize)(User_1.UserRole.ADMIN), loanController_1.AdminDashBoard);
exports.default = router;
//# sourceMappingURL=admin.js.map