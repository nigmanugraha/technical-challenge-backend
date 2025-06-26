import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { CustomExceptionFilter } from './@shared/exception/custom-error.exception';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED REJECTION:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors();

  const RABBITMQ_URL = process.env.RABBITMQ_URL;
  const RABBITMQ_QUEUE = process.env.RABBITMQ_QUEUE;
  // RabbitMQ microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [RABBITMQ_URL], // atau pakai docker host
      queue: RABBITMQ_QUEUE,
      queueOptions: { durable: false },
      socketOptions: {
        reconnectTimeInSeconds: 5,
      },
    },
  });

  app.useGlobalFilters(new CustomExceptionFilter());

  const port = process.env.PORT ?? 4000;
  await app.startAllMicroservices();
  await app.listen(port);
}
bootstrap();
