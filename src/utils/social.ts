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

export const PHONE_DISPLAY = '+7 (992) 014-71-27';
export const PHONE_HREF    = 'tel:+79920147127';
export const EMAIL_DISPLAY = 'yaninav-jewelrystudio@yandex.ru';
export const EMAIL_HREF    = 'mailto:yaninav-jewelrystudio@yandex.ru';
