import { getSiteContactChannels } from '@/lib/contact.server';
import FooterClient from '@/components/FooterClient';

export default async function Footer() {
  const channels = await getSiteContactChannels();
  return <FooterClient channels={channels} />;
}
