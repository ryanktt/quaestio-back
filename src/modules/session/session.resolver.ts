import { Session } from './session.schema';

import { Resolver, ResolveField, Parent, Context, ObjectType, Field, Mutation } from '@nestjs/graphql';
import { UserSessionRepository } from '@modules/shared/user-session/user-session.repository';
import { IUserContext } from './session.interface';
import { SessionService } from './session.service';
import { User } from '@modules/user/user.schema';
import { Role } from '@utils/utils.decorators';

@ObjectType()
class LogOutResponse {
	@Field(() => Session)
	session: Session;

	@Field(() => User)
	user: User;
}
@Resolver(() => Session)
export class SessionResolver {
	constructor(
		private readonly sessionService: SessionService,
		private readonly userSessionRepository: UserSessionRepository,
	) { }

	@ResolveField(() => User)
	async user(@Parent() session: Session): Promise<User> {
		return this.userSessionRepository.userLoader().load(session.user);
	}

	@Role('User')
	@Mutation(() => LogOutResponse)
	async userlogOut(@Context() { user, session }: IUserContext): Promise<LogOutResponse> {
		await this.sessionService.deactivateSession(session);
		return { session, user };
	}
}
