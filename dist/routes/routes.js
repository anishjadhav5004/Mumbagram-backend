"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import authController from "../controller/authController"
const authController_1 = __importDefault(require("../controller/authController"));
const multer_1 = __importDefault(require("multer"));
const postController_1 = __importDefault(require("../controller/postController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const userController_1 = __importDefault(require("../controller/userController"));
const profileController_1 = __importDefault(require("../controller/profileController"));
const notification_1 = __importDefault(require("../controller/notification"));
const commnetController_1 = __importDefault(require("../controller/commnetController"));
const path_1 = __importDefault(require("path"));
// import { log } from "console"
const uploadPath = path_1.default.join(__dirname, '..', '..', '..', 'final-project-angular', 'frontend', 'public', 'assets');
// C:\Users\AnishJadhavINDev\Documents\final project angular\frontend\public
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
let path1;
const upload = (0, multer_1.default)({ storage: storage });
const routes = express_1.default.Router();
routes.post('/signup', authController_1.default.signUp);
routes.post('/login', authController_1.default.logIn);
routes.get('/logout', authController_1.default.logOut);
routes.use(authMiddleware_1.default);
routes.get('/getUserProfile', profileController_1.default.getUserProfile);
routes.patch('/updateUsername', profileController_1.default.updateUsername);
routes.patch('/updateEmail', profileController_1.default.updateEmail);
routes.patch('/updatePhoneNumber', profileController_1.default.updatePhoneNumber);
routes.patch('/updateBio', profileController_1.default.updateBio);
routes.patch('/updatePassword', profileController_1.default.updatePassword);
routes.patch('/updateProfile', upload.single('file'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // console.log("hited update profilepoic");
        let path = (_a = req.file) === null || _a === void 0 ? void 0 : _a.filename;
        yield profileController_1.default.updateProfilePic(path);
        res.status(200).json({ msg: 'profile updated successfully' });
    }
    catch (err) {
        next(err);
    }
}));
routes.get('/getPost', postController_1.default.getPost);
routes.post('/addPost', upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    path1 = req.file.filename;
    console.log(req.file.filename);
    const { caption } = req.body;
    const result = yield postController_1.default.addPost(path1, caption);
    if (result == "user not found") {
        res.json({ "msg": "failed to post" });
    }
    else {
        res.json({ "msg": "picture posted" });
    }
}));
routes.delete('/deletePost/:postId', postController_1.default.deletePost);
routes.get('/getUser', userController_1.default.getUser);
routes.get('/getUsers/:username', userController_1.default.getUsers);
routes.get('/getUser/:username', userController_1.default.getUserByUsername);
// routes.patch('/updateLike',authentication,postController.updateLike)
routes.post('/addLike', postController_1.default.addLike);
routes.delete('/deleteLike/:postId', postController_1.default.deletLike);
routes.post('/follow', profileController_1.default.follow);
routes.get('/isFollow/:followingId/:followerId', profileController_1.default.isFollow);
routes.post('/unFollow', profileController_1.default.unFollow);
routes.get('/getFollowers/:profileId', profileController_1.default.getFollowers);
routes.get('/getFollowing/:profileId', profileController_1.default.getFollowing);
routes.get('/getNotification/:profileId', notification_1.default.getNotificaion);
routes.post('/addNotification/', notification_1.default.addNotification);
routes.post('/addComment', commnetController_1.default.addComment);
routes.get('/getComments/:postId', commnetController_1.default.getComment);
routes.delete('/deleteComment/:commentId', commnetController_1.default.deleteComment);
routes.get('/getAllUsers', userController_1.default.getAll);
routes.delete('/deleteUser/:userId', userController_1.default.deleteUser);
routes.post('/report', notification_1.default.addReport);
routes.get('/getReports', notification_1.default.getReport);
// routes.post('/auth/reset-pass', authentication,)
// routes.get('/getFollowersInsights',authentication,)
exports.default = routes;
