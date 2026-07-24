/** GraphQL Playground disabled in production. */
import config from '@payload-config';
import '@payloadcms/next/css';
import { GRAPHQL_PLAYGROUND_GET } from '@payloadcms/next/routes';

const playgroundHandler = GRAPHQL_PLAYGROUND_GET(config);

export const GET = (req: Request) => {
  if (process.env.NODE_ENV === 'production') {
    return new Response('Not Found', { status: 404 });
  }
  return playgroundHandler(req);
};
