import {Document, Model} from 'mongoose';

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  salt: string;
  token?: string;
}

export interface UserDocument extends User, Document {
  comparePassword(password: string): boolean;
}

type UserModel = Model<UserDocument>;
export default UserModel;
