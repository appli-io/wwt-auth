import { IoAdapter }     from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient }  from 'redis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    try {
      const pubClient = createClient({url: process.env.REDIS_URL});
      const subClient = pubClient.duplicate();

      await Promise.all([ pubClient.connect(), subClient.connect() ]);

      this.adapterConstructor = createAdapter(pubClient, subClient);
    } catch (error) {
      console.error('Error connecting to Redis:', error);
      throw new Error('Could not connect to Redis');
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
