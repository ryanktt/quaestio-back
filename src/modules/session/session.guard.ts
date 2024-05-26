/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ESessionErrorCode } from './session.interface';
import { SessionService } from './session.service';

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AppError } from '@utils/utils.error';
import { EUserRole } from '@modules/user/user.interface';
import { Reflector } from '@nestjs/core';

@Injectable()
export class SessionGuard implements CanActivate {
	constructor(private readonly sessionService: SessionService, private readonly reflector: Reflector) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const ctx = GqlExecutionContext.create(context).getContext();

		const authToken = ctx.authToken as string;
		const ctxRole = this.reflector.get<EUserRole>('role', context.getHandler());

		if (ctxRole) {
			const { user, session } = await this.sessionService.authenticateUser(authToken);
			if (user.role !== ctxRole && ctxRole !== EUserRole.User) {
				throw new AppError({ code: ESessionErrorCode.INVALID_SESSION, message: 'invalid session' });
			}

			ctx.session = session;
			ctx.user = user;
		}

		return true;
	}
}
