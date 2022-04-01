import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { User } from './user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
	constructor(@InjectModel('User') private readonly userSchema: Model<User>) {}

	async fetchUserById(userId: string): Promise<User> {
		return this.userSchema.findById(userId);
	}

	async createUser(
		name: string,
		email: string,
		phoneNumber: string,
	): Promise<User> {
		return this.userSchema.create({ name, email, phoneNumber });
	}
}
