
import authRepo from "../repository/auth-repo";
import { Profile } from "../entities/profile";
import { User } from "../entities/user";
import jwt from "jsonwebtoken";
import AppDataSource from "../configuration/config";
import { Role } from "../enums/enum";
import { AppError } from "../types/errorHandler";
import { error, log } from "console";
import { plainToInstance } from "class-transformer";
import { SignUpDto } from "../dto/signupDto";
import { validate, Validate } from "class-validator";
import { loginDto } from "../dto/loginDto";
import { NextFunction, Request, Response } from "express";

export const secretKey = "ansh";

const userRepo = AppDataSource.getRepository(User)
const profileRepo = AppDataSource.getRepository(Profile)

class AuthService {

    signUp = async (req: Request, res: Response) => {

        const { userName, password, email, fullName, phoneNumber } = req.body;

        const userExist = await profileRepo.findOne({
            where:{
                email:email
            }
        })
        if(userExist){

            throw new AppError('email already exists',409)

        }
        const userExist1 = await profileRepo.findOne({
            where:{
                userName:userName
            }
        })
        if(userExist1){

            throw new AppError('username already exists',409)

        }


        const userDto = plainToInstance(SignUpDto,req.body)

        const errors = await validate(userDto)

        if(errors.length>0){

            throw new AppError('invalid data',400)

        }

        console.log(userDto);
        

        const profile = new Profile();
        profile.email = userDto.email;
        profile.phoneNumber = userDto.phoneNumber;
        profile.userName = userDto.userName
        profile.role = Role.User
        profile.status = false

        const user = new User();
        user.fullName = userDto.fullName;
        user.phoneNumber = userDto.phoneNumber
        user.password = userDto.password;
        user.role = Role.User
        user.status = false

        user.profile = profile
        user.post = [];

        return await authRepo.signUp(user);
    };


    logIn = async (req: Request, res: Response, next : NextFunction) => {
        
    
        const credentialDto = plainToInstance(loginDto,req.body)
        const errors = await validate(credentialDto);
        if(errors.length){

            throw new AppError('invalid data',400)
        }

        console.log(credentialDto);
        
        const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(req.body.identifier)
        
        let profile;
  
        if(isEmail){

            console.log(credentialDto.email);

            profile = await profileRepo.findOne({
                
                where:{

                email:req.body.identifier

                },
                relations:{
                    user:true
                }
                
            });

        }
        else{
            console.log("else",req.body.identifier);

            profile = await profileRepo.findOne({

                where:{

                    userName:req.body.identifier

                    // isEmail?{email:req.body.email}:{username:credentialDto.email}
                },
                relations:{

                    user:true
                }
                
            });
        }

        console.log(profile);
        
        
        if (!profile || profile.status===true) {

            // res.status(400).j    son({ msg: "user not found" });
            console.log("profile err");
            
            throw new AppError('user not found',404);

        } else {
            if (credentialDto.password === profile?.user.password) {
                const token = jwt.sign({ id: profile?.user.userId }, secretKey, { expiresIn: '1 h' });
                const tokenWtBearer = 'bearer ' + token;
                res.cookie('authToken', tokenWtBearer,{
                    secure:true,
                    httpOnly:true,
                    sameSite:'lax',
                    maxAge:60*60*1000});
                console.log("success fullu");
                
                res.status(200).json({ msg: "logged in" });
            } else {
                console.log("erroroororo");
                
                // throw new AppError('wrong credential',401)
                res.status(401).json({msg:'token expiered'})
            }
        }
    };

}

export default new AuthService();