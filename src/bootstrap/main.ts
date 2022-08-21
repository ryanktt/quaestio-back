/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import rateLimit from 'express-rate-limit';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import requestIp from 'request-ip';

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule);
	app.enableCors();
	app.use(
		rateLimit({
			message: 'Too many requests, please try again later.',
			windowMs: 5 * 60 * 1000,
			max: 300,
		}),
	);
	app.use(requestIp.mw());
	await app.listen(4000);

	const hot = (module as { hot?: { accept: () => unknown; dispose: (cb: () => Promise<void>) => unknown } })
		.hot;
	if (hot) {
		hot.accept();
		hot.dispose(() => app.close());
	}
}
void bootstrap();
