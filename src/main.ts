import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { CustomExceptionFilter } from './@shared/exception/custom-error.exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors();

  app.useGlobalFilters(new CustomExceptionFilter());

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
