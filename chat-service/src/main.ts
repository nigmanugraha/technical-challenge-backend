// chat-main.ts
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const RABBITMQ_URL = process.env.RABBITMQ_URL;
  const RABBITMQ_QUEUE = process.env.RABBITMQ_QUEUE;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [RABBITMQ_URL],
        queue: RABBITMQ_QUEUE,
        queueOptions: { durable: false },
        socketOptions: {
          reconnectTimeInSeconds: 5,
        },
      },
    },
  );

  await app.listen();
}
bootstrap();
