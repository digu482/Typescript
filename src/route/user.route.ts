import express from 'express';
import { createuser, UserLogin, userfind, updateuser, userdelete, changepassword, logout, searchUsers } from '../controller/user.controller'
const router = express.Router()
// const controller = require("../controller/user.controller")
import { userverifyToken } from '../middleware/auth';

router.post('/register',createuser);
router.post("/login",UserLogin)
router.post("/logout", userverifyToken,logout);
router.get("/find",userverifyToken,userfind)
router.patch("/update",userverifyToken,updateuser)
router.delete("/delete",userverifyToken,userdelete)
router.post("/changepassword",userverifyToken,changepassword);
router.get("/search",searchUsers)

export default router;