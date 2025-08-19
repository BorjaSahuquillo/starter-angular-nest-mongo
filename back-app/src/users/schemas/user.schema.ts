import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  password?: string; // Opcional para usuarios de Google OAuth

  @Prop()
  picture?: string;

  @Prop()
  givenName?: string;

  @Prop()
  familyName?: string;

  @Prop()
  locale?: string;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ type: [String], default: ['user'] })
  roles: string[];

  @Prop()
  googleId?: string; // ID de Google OAuth

  @Prop({ default: 'local' })
  provider: string; // 'local', 'google'

  @Prop()
  refreshToken?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLogin?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
