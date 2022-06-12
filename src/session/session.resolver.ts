import { Session } from './session.schema';

import { Resolver, ResolveField, Parent, Context } from '@nestjs/graphql';
import { ILoaders } from 'src/app.loaders';
import { User } from 'src/user';

@Resolver(() => Session)
export class SessionResolver {
	@ResolveField(() => User)
	async user(@Parent() session: Session, @Context('loaders') { adminLoader }: ILoaders): Promise<User> {
		return adminLoader.load(session.user);
	}
}
