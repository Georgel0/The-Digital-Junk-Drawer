import Redis from 'ioredis';

let redis;

if (!global._redis) {
  global._redis = new Redis(process.env.REDIS_URL, {
    // Fail fast instead of hanging the request
    connectTimeout: 5000,       // give up connecting after 5s
    commandTimeout: 5000,       // give up on a stuck command after 5s
    maxRetriesPerRequest: 1,    // don't retry a failed command forever
    retryStrategy(times) {
      if (times > 2) return null; // stop retrying after 2 attempts
      return Math.min(times * 200, 1000);
    },
    enableOfflineQueue: true,  // don't queue commands while disconnected
    lazyConnect: false,
  });

  // Prevent unhandled 'error' events from crashing the function
  global._redis.on('error', (err) => {
    console.error('Redis client error:', err.message);
  });
}

redis = global._redis;

export default redis;