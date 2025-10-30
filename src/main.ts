import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  })

  const port = process.env.PORT
  if (!port) {
    console.error('PORT not found in environment variables')
    process.exit(1)
  }

  
  await app.listen(port)
  console.log(`Server is running on port ${port}`)
}
bootstrap()
