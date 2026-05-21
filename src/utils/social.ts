import { SiVk, SiInstagram, SiTelegram, SiPinterest } from 'react-icons/si';
import type { ComponentType } from 'react';

export interface SocialLink {
  href: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
}

export const SOCIAL_LINKS: SocialLink[] = [
  { href: 'https://vk.com/yanina_v_js',                                                    label: 'ВКонтакте', Icon: SiVk },
  { href: 'https://pin.it/167eneWKe',                                                       label: 'Pinterest',  Icon: SiPinterest },
  { href: 'https://www.instagram.com/yanina_v_jewelry_studio_?igsh=cWtqcTV6bGFybWVi',     label: 'Instagram',  Icon: SiInstagram },
  { href: 'https://t.me/yanina_v_jewelry',                                                  label: 'Telegram',   Icon: SiTelegram },
];
