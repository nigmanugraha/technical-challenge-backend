// chat-main.ts
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [
          'amqps://zriteyhr:pD8imSDf_I4OSMdarhWESAszwZz4KAs1@fuji.lmq.cloudamqp.com/zriteyhr',
        ],
        queue: 'chat_queue',
        queueOptions: { durable: false },
      },
    },
  );

  await app.listen();
}
bootstrap();
