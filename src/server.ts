import express, { NextFunction, urlencoded } from "express"
import AppDataSource from "./configuration/config";
import cors from "cors"
import cookieParser from "cookie-parser";
// import multer from "multer";
// import postController from "./controller/postController";
import routes from "./routes/routes";
// app.use(express.urlencoded({extended:false}))
import 'reflect-metadata'
import { createServer } from 'http';
import {Server} from "socket.io"
import { Message } from "./entities/message";
import { globalErrorHandler } from "./middleware/error";
import authentication from "./middleware/authMiddleware";
// import { error, log } from "console";

const app = express();
const port = process.env.PORT;
app.use(cookieParser())

// console.log(process.env);


const server = createServer(app);

const io = new Server(server,{
    cors: {
      origin:' http://localhost:4200',  
    }
});

let userSocketMap = new Map<string,string>();


app.use(cors({
    origin:'http://localhost:4200',
    credentials:true
    
}))

app.use(express.json())

app.use("/",routes)

app.use(globalErrorHandler)

AppDataSource.initialize().then(

    ()=>{

        // app.listen(port,()=>{

            
        //     console.log(`listening on port ${port}`);

        // }) 
        server.listen(port,()=>{

            console.log("listening on port ",port);
            
        })
    }
).catch(


    (error)=>{

        // next(error);
        // console.log(error);
        console.log(error);
    }
)


io.on("connection",(socket)=>{
    console.log("user connected",socket.id);

    socket.on("register",(userId:string)=>{

        userSocketMap.set(userId,socket.id)
        console.log(userId,"registered with socketId",socket.id);
    })   

    socket.on("private_message",async({senderId,receiverId,content})=>{

        const receiverSocketId = userSocketMap.get(receiverId);
        console.log(receiverSocketId);
        
        const messageRepository = AppDataSource.getRepository(Message);

        const message = messageRepository.create({senderId,receiverId,content});
        await messageRepository.save(message);

        if(receiverSocketId){
            console.log(senderId,receiverId,receiverSocketId);
            
            io.to(receiverSocketId).emit("private_message",{senderId,content})
        }
    });


    socket.on("disconnect",()=>{
        userSocketMap.forEach((socketId,userId)=>{

            if(socketId==socket.id){
                userSocketMap.delete(userId);
            }
        });
        console.log("user disconnected",socket.id);
        
    })
})
