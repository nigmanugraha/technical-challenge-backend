import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  _id: false,
})
export class Profile {
  @Prop({ default: null })
  name: string;

  @Prop({ default: null })
  birthday: Date;

  @Prop({ default: null })
  height: number;

  @Prop({ default: null })
  weight: number;
}

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ unique: true, required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: [], type: [String] })
  interests: string[];

  @Prop({ default: null, type: Profile })
  profile: Profile;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
