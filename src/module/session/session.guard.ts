/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { SessionService } from './session.service';

@Injectable()
export class SessionGuard implements CanActivate {
	constructor(private readonly sessionService: SessionService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const gqlContext = GqlExecutionContext.create(context);
		console.log(gqlContext);
		const req = context.getArgByIndex(2).req;

		const authenticationToken = req.headers.auth as string;
		const userAgent = req.headers['user-agent'];
		// const clientIp = req.clientIp;

		const { user, session } = await this.sessionService.authenticateUser(authenticationToken);

		req.authenticationToken = authenticationToken;
		req.userAgent = userAgent;
		req.session = session;
		req.user = user;

		return true;
	}
}

// @Injectable()
// export class AuthGuard implements CanActivate {
// 	constructor(private readonly authService: AuthService) {}

// 	async canActivate(context: ExecutionContext): Promise<boolean> {
// 		const gqlContext = GqlExecutionContext.create(context);
// 		const req = context.getArgByIndex(2).req;

// 		const authenticationToken = req.headers.auth as string;
// 		const userAgent = req.headers['user-agent'];
// 		// const clientIp = req.clientIp;

// 		const { user, session } = await this.authService.authenticateUser(authenticationToken);

// 		req.authenticationToken = authenticationToken;
// 		req.userAgent = userAgent;
// 		req.session = session;
// 		req.user = user;

// 		return true;
// 	}
// }
