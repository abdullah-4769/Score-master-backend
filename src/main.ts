import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 6000);



 //  Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:61561', // Flutter web debug server
      'http://127.0.0.1:54206', // Sometimes Flutter uses 127.0.0.1
    ],
    credentials: true,
  });
}
bootstrap();