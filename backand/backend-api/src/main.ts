import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  const port = process.env.PORT || 3000;
  await app.listen(port);
  // Loga a porta de escuta real para ajudar no debug
  // (ajuda a confirmar se uma variável de ambiente mudou a porta)

  console.log(`Listening on port ${port}`);
}
bootstrap();
