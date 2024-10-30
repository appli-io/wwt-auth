import { IoAdapter }     from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient }  from 'redis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(maxRetries: number = 5, delay: number = 2000): Promise<void> {
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        const pubClient = createClient({url: process.env.REDIS_URL});
        const subClient = pubClient.duplicate();

        await Promise.all([ pubClient.connect(), subClient.connect() ]);

        this.adapterConstructor = createAdapter(pubClient, subClient);
        console.log('Connected to Redis successfully');
        return; // Exit the function if connection is successful
      } catch (error) {
        attempts++;
        console.error(`Error connecting to Redis (attempt ${ attempts }):`, error);

        if (attempts < maxRetries) {
          console.log(`Retrying in ${ delay }ms...`);
          await new Promise(resolve => setTimeout(resolve, delay)); // Wait before retrying
        } else {
          console.error('Max retries reached. Could not connect to Redis.');
        }
      }
    }
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    } else {
      console.warn('Redis adapter is not initialized. Ensure connectToRedis is called before creating the server.');
    }
    return server;
  }
}
