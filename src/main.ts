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

  const server = await app.listen(port)
  
  // Add timeout configuration for Render
  server.setTimeout(300000); // 5 minutes timeout
  server.keepAliveTimeout = 300000; // 5 minutes keep-alive
  
  console.log(`Server is running on port ${port}`)
  console.log(`Health check available at: http://localhost:${port}/health`)
}
bootstrap()