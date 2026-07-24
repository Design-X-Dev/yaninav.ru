/** GraphQL POST disabled in production. */
import config from '@payload-config';
import '@payloadcms/next/css';
import { GRAPHQL_POST, REST_OPTIONS } from '@payloadcms/next/routes';

const graphqlPost = GRAPHQL_POST(config);

export const POST = (req: Request) => {
  if (process.env.NODE_ENV === 'production') {
    return new Response('Not Found', { status: 404 });
  }
  return graphqlPost(req);
};

export const OPTIONS = REST_OPTIONS(config);
