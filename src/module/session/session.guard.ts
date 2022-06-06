/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class SessionGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		const req = context.getArgByIndex(2);
		const userAgent = req.req.headers['user-agent'];
		const clientIp = req.req.clientIp;
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
