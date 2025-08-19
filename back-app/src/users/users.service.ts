import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserData: Partial<User>): Promise<User> {
    const createdUser = new this.userModel(createUserData);
    return await createdUser.save();
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email }).exec();
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return await this.userModel.findOne({ googleId }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return await this.userModel.findById(id).exec();
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { refreshToken }).exec();
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, { lastLogin: new Date() })
      .exec();
  }

  async updateGoogleData(
    userId: string,
    googleData: {
      googleId: string;
      picture?: string;
      givenName?: string;
      familyName?: string;
      locale?: string;
      emailVerified?: boolean;
    },
  ): Promise<User | null> {
    return await this.userModel
      .findByIdAndUpdate(userId, googleData, { new: true })
      .exec();
  }
}
