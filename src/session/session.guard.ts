/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { IAdminContext } from './session.interface';
import { SessionService } from './session.service';

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ERole } from '@utils/*';

@Injectable()
export class SessionGuard implements CanActivate {
	constructor(private readonly sessionService: SessionService, private readonly reflector: Reflector) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.getArgByIndex(2).req;

		const authToken = req.headers.auth as string;
		const userAgent = req.headers['user-agent'];

		req.userAgent = userAgent;
		req.authToken = authToken;

		const role = this.reflector.get<ERole>('role', context.getHandler());
		if (role === ERole.ADMIN) {
			const adminRequest = req as IAdminContext;
			const { user, session } = await this.sessionService.authenticateUser(authToken);
			adminRequest.session = session;
			adminRequest.user = user;
		}

		return true;
	}
}
