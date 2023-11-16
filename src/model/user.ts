import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
  Name: string;
  email: string;
  mobile: number;
  password: string;
  isdelete: boolean;
  token: string;
}

const Userschema = new mongoose.Schema<IUser>(
  {
    Name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    mobile: {
      type: Number,
      unique: true,
    },
    password: {
      type: String,
    },
    isdelete: {
      type: Boolean,
      default: false,
    },
    token: {
      type: String,
    },
  },
  { versionKey: false }
);

const User = mongoose.model<IUser>('User', Userschema);

export default User;
