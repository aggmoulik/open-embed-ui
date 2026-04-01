import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { randomUUID } from 'crypto';
import * as schema from './schema';

async function seed() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const db = drizzle(client, { schema });

  console.log('Seeding database...');

  const userId = randomUUID();
  const widgetId = randomUUID();
  const embedId = randomUUID();

  await db.insert(schema.users).values({
    id: userId,
    name: 'Demo User',
    email: 'demo@example.com',
    githubId: '12345',
    githubUsername: 'demo-user',
    image: 'https://avatars.githubusercontent.com/u/12345',
  });

  await db.insert(schema.widgets).values({
    id: widgetId,
    userId,
    name: 'My Open Source Contributions',
    description: 'A widget showing my recent GitHub contributions',
    config: {
      theme: 'system',
      timeRange: 'month',
      layout: 'grid',
      maxItems: 10,
    },
    isPublic: true,
  });

  await db.insert(schema.embeds).values({
    id: embedId,
    widgetId,
    embedCode: `<iframe src="http://localhost:3000/embed/${widgetId}" width="600" height="400"></iframe>`,
    allowedDomains: '*',
    viewCount: 0,
  });

  console.log('Seed complete!');
  console.log(`  User: ${userId}`);
  console.log(`  Widget: ${widgetId}`);
  console.log(`  Embed: ${embedId}`);

  client.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
