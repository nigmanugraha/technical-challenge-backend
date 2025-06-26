import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { CustomExceptionFilter } from './@shared/exception/custom-error.exception';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors();

  // RabbitMQ microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        'amqps://zriteyhr:pD8imSDf_I4OSMdarhWESAszwZz4KAs1@fuji.lmq.cloudamqp.com/zriteyhr',
      ], // atau pakai docker host
      queue: 'user_queue',
      queueOptions: { durable: false },
    },
  });
  await app.startAllMicroservices();
  console.log('✅ RabbitMQ microservice started!');

  app.useGlobalFilters(new CustomExceptionFilter());

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
