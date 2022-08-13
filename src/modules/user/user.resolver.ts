import { User } from './user.schema';

import { ObjectType, Resolver, Mutation, Context, Field } from '@nestjs/graphql';
import { IUserContext, Session, SessionService } from '@modules/session';
import { forwardRef, Inject } from '@nestjs/common';
import { Role } from '@utils/*';

@ObjectType()
class LogOutResponse {
	@Field(() => Session)
	session: Session;

	@Field(() => User)
	user: User;
}

@Resolver(() => User)
export class UserResolver {
	constructor(@Inject(forwardRef(() => SessionService)) private readonly sessionService: SessionService) {}

	@Role('User')
	@Mutation(() => LogOutResponse)
	async userlogOut(@Context() { user, session }: IUserContext): Promise<LogOutResponse> {
		await this.sessionService.deactivateSession(session);
		return { session, user };
	}
}
