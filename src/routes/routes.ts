import express, { NextFunction, Request, Response, Router } from "express"
// import authController from "../controller/authController"
import authController from "../controller/authController"
import multer from "multer"
import postController from "../controller/postController"
import authentication from "../middleware/authMiddleware"
import userController from "../controller/userController"
import profileController from "../controller/profileController"
import notification from "../controller/notification"
import CommnetController from "../controller/commnetController"
import path from "path";
// import { log } from "console"

const uploadPath = path.join(__dirname, '..', '..', '..', 'final-project-angular', 'frontend', 'public', 'assets')

// C:\Users\AnishJadhavINDev\Documents\final project angular\frontend\public

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

let path1: string

const upload = multer({ storage: storage });

const routes = express.Router()

routes.post('/signup', authController.signUp)
routes.post('/login', authController.logIn)
routes.get('/logout', authController.logOut)

routes.use(authentication)

routes.get('/getUserProfile', profileController.getUserProfile)

routes.patch('/updateUsername', profileController.updateUsername)
routes.patch('/updateEmail', profileController.updateEmail)
routes.patch('/updatePhoneNumber', profileController.updatePhoneNumber)
routes.patch('/updateBio', profileController.updateBio)
routes.patch('/updatePassword', profileController.updatePassword)
routes.patch('/updateProfile', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {

    try {

        // console.log("hited update profilepoic");
        
        let path = req.file?.filename

        await profileController.updateProfilePic(path!)

        res.status(200).json({ msg: 'profile updated successfully' })

    }
    catch (err) {

        next(err)

    }
})





routes.get('/getPost', postController.getPost)
routes.post('/addPost', upload.single('file'), async (req: any, res: any) => {

    path1 = req.file.filename
    console.log(req.file.filename);

    const { caption } = req.body

    const result = await postController.addPost(path1, caption)

    if (result == "user not found") {

        res.json({ "msg": "failed to post" });
    }
    else {

        res.json({ "msg": "picture posted" })
    }
});

routes.delete('/deletePost/:postId', postController.deletePost)



routes.get('/getUser',  userController.getUser)
routes.get('/getUsers/:username', userController.getUsers)
routes.get('/getUser/:username',  userController.getUserByUsername)

// routes.patch('/updateLike',authentication,postController.updateLike)

routes.post('/addLike', postController.addLike)
routes.delete('/deleteLike/:postId',  postController.deletLike)


routes.post('/follow', profileController.follow)
routes.get('/isFollow/:followingId/:followerId', profileController.isFollow)
routes.post('/unFollow', profileController.unFollow)
routes.get('/getFollowers/:profileId', profileController.getFollowers)
routes.get('/getFollowing/:profileId', profileController.getFollowing)

routes.get('/getNotification/:profileId', notification.getNotificaion)
routes.post('/addNotification/', notification.addNotification)

routes.post('/addComment', CommnetController.addComment)
routes.get('/getComments/:postId', CommnetController.getComment)
routes.delete('/deleteComment/:commentId', CommnetController.deleteComment)

routes.get('/getAllUsers', userController.getAll)
routes.delete('/deleteUser/:userId', userController.deleteUser)

routes.post('/report', notification.addReport)
routes.get('/getReports', notification.getReport)

// routes.post('/auth/reset-pass', authentication,)
// routes.get('/getFollowersInsights',authentication,)















export default routes