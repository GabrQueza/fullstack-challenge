import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { MikroORM } from "@mikro-orm/core";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672'],
      queue: 'wallets_queue',
      noAck: false,
      queueOptions: {
        durable: true
      },
    },
  });

  // Auto-create/update database schema
  const orm = app.get(MikroORM);
  await orm.schema.update();

  await app.startAllMicroservices();
  
  app.enableCors({ origin: 'http://localhost:3000', credentials: true });
  const port = process.env.PORT || 4002;
  await app.listen(port, "0.0.0.0");
  console.log(`Wallets service running on port ${port}`);
}

bootstrap();
