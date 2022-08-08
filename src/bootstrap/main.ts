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
}
void bootstrap();
