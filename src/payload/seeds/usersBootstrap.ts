import type { Payload } from 'payload';

const MIN_PASSWORD_LENGTH = 8;

function readAdminCredentials(): { email: string; password: string } | null {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();

  if (!email || !password) return null;

  if (!email.includes('@')) {
    throw new Error('[payload] Users: ADMIN_EMAIL must be a valid email address');
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `[payload] Users: ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters`,
    );
  }

  return { email, password };
}

/**
 * При старте Payload: создаёт первого admin-пользователя из env, если коллекция `users` пуста.
 * Идемпотентно — существующих пользователей не перезаписывает.
 */
export async function seedAdminIfMissing(payload: Payload): Promise<void> {
  const existing = await payload.find({
    collection: 'users',
    limit: 0,
    overrideAccess: true,
  });

  if (existing.totalDocs > 0) return;

  const credentials = readAdminCredentials();

  if (!credentials) {
    const message =
      '[payload] Users: no admin in database and ADMIN_EMAIL/ADMIN_PASSWORD are not set. ' +
      'Set both env vars for automatic bootstrap, or create the first user manually at /admin.';

    if (process.env.NODE_ENV === 'production') {
      throw new Error(message);
    }

    payload.logger.warn({ msg: message });
    return;
  }

  await payload.create({
    collection: 'users',
    overrideAccess: true,
    data: {
      email: credentials.email,
      password: credentials.password,
      role: 'admin',
    },
  });

  payload.logger.info({
    msg: `[payload] Users: seeded admin email=${credentials.email}`,
  });
}
