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
const config_1 = __importDefault(require("../configuration/config"));
const follow_1 = require("../entities/follow");
const profile_1 = require("../entities/profile");
const user_1 = require("../entities/user");
const authMiddleware_1 = require("../middleware/authMiddleware");
const profile_repo_1 = __importDefault(require("../repository/profile-repo"));
const errorHandler_1 = require("../types/errorHandler");
const updateDto_1 = require("../dto/updateDto");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const userRepository = config_1.default.getRepository(user_1.User);
const profileRepository = config_1.default.getRepository(profile_1.Profile);
const followRepository = config_1.default.getRepository(follow_1.Follow);
class profileService {
    getUserProfile() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield profile_repo_1.default.getUserProfile();
        });
    }
    updateUsername(body) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateProfileDto = (0, class_transformer_1.plainToInstance)(updateDto_1.updateDto, body);
            const error = yield (0, class_validator_1.validate)(updateProfileDto);
            if (error.length) {
                throw new errorHandler_1.AppError('invalid data', 400);
            }
            console.log(updateProfileDto);
            return yield profile_repo_1.default.updateUsername(body.newUsername, body.profileId);
        });
    }
    updateEmail(body) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(body);
            return yield profile_repo_1.default.updateEmail(body.newEmail, body.profileId);
        });
    }
    updatePhoneNumber(body) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(body);
            return yield profile_repo_1.default.updatePhoneNumber(body.newPhoneNumber, body.profileId);
        });
    }
    updateBio(body) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(body);
            return yield profile_repo_1.default.updateBio(body.newBio, body.profileId);
        });
    }
    updatePassword(body) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(body);
            const user = yield userRepository.findOneBy({
                userId: authMiddleware_1.id
            });
            if (!user) {
                return "user not found";
            }
            if (user.password === body.currentPass) {
                // return await profileRepo.updatePassword( body.updatedPass,body.profileId)
                user.password = body.updatedPass;
                yield userRepository.save(user);
                return "password updated successfully";
            }
            else {
                return "current password doesnt match";
            }
        });
    }
    follow(followerId, followingId, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (followerId === followingId) {
                return res.status(400).json({ "msg": "you cant follow yourself" });
            }
            const follower = yield profileRepository.findOneBy({ id: Number(followerId) });
            const following = yield profileRepository.findOneBy({ id: Number(followingId) });
            if (!follower || !following) {
                return res.status(404).json({ "msg": "user not found" });
            }
            const existingFollow = yield followRepository.findOne({
                where: { followers: follower, following: following }
            });
            if (existingFollow) {
                return res.status(400).json({ "msg": "already following this user" });
            }
            const follow = new follow_1.Follow();
            follow.followers = follower;
            follow.following = following;
            yield followRepository.save(follow);
            res.status(201).json({ "msg": "success" });
        });
    }
    isFollow(followingId, followerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const follower = yield profileRepository.findOneBy({ id: Number(followerId) });
            const following = yield profileRepository.findOneBy({ id: Number(followingId) });
            const existingFollow = yield followRepository.findOne({
                where: { followers: follower, following: following }
            });
            console.log(existingFollow);
            if (existingFollow) {
                return true;
            }
            else {
                return false;
            }
        });
    }
    unFollow(followingId, followerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield followRepository.delete({
                followers: {
                    id: followerId
                }, following: {
                    id: followingId
                }
            });
            return result;
        });
    }
    getFollowers(profileId) {
        return __awaiter(this, void 0, void 0, function* () {
            const followers = yield followRepository.find({
                where: {
                    following: {
                        id: Number(profileId),
                        status: false
                    }
                },
                relations: {
                    followers: true
                }
            });
            console.log("lowers", followers);
            return followers;
        });
    }
    getFollowing(profileId) {
        return __awaiter(this, void 0, void 0, function* () {
            const followings = yield followRepository.find({
                where: {
                    followers: {
                        id: Number(profileId),
                        status: false
                    }
                },
                relations: {
                    following: true
                }
            });
            return followings;
        });
    }
    updateProfilePic(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield userRepository.findOne({
                where: {
                    userId: authMiddleware_1.id
                },
                relations: {
                    profile: true
                }
            });
            if (!user) {
                throw new errorHandler_1.AppError('user not found', 404);
            }
            user.profile.profilePic = path;
            userRepository.save(user);
        });
    }
}
exports.default = new profileService();
