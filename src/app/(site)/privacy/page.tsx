import type { Metadata } from 'next';
import InfoPageLayout from '@/components/InfoPageLayout';
import { THEME } from '@/utils/theme';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности | ЯНИНА В',
  description:
    'Политика конфиденциальности ювелирной студии ЯНИНА В: сбор и использование персональных данных, ваши права и безопасность информации.',
};

const { heading, text } = THEME;

export default function PrivacyPage() {
  return (
    <InfoPageLayout showLegalDivider>
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-8" style={{ color: heading }}>
        Политика конфиденциальности
      </h1>

      <div className="space-y-8 text-base leading-relaxed" style={{ color: text }}>
        <section>
          <p>
            Ювелирная студия <strong style={{ color: heading }}>ЯНИНА В</strong> ценит доверие своих клиентов и
            обязуется обеспечивать полную конфиденциальность персональных данных. Настоящая политика определяет
            порядок обработки и защиты информации, полученной от пользователей нашего сайта.
          </p>
        </section>

        {[
          {
            title: 'Какие данные мы собираем?',
            content: (
              <>
                <p className="mb-3">Мы собираем следующую информацию:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>имя и контактные данные (телефон, e-mail);</li>
                  <li>адрес доставки (при заказе товаров);</li>
                  <li>данные банковских карт (шифруются и передаются платёжным операторам);</li>
                  <li>IP-адрес и cookie-файлы (для улучшения функционала сайта).</li>
                </ul>
              </>
            ),
          },
          {
            title: 'Как мы используем собранные данные?',
            content: <p>Собранные данные используются исключительно для исполнения обязательств перед клиентами, включая обработку заказов, предоставление консультаций и улучшение качества обслуживания.</p>,
          },
          {
            title: 'Ваши права',
            content: (
              <>
                <p className="mb-3">Пользователь вправе:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>получать информацию о собранных данных;</li>
                  <li>требовать исправления или удаления неверных данных;</li>
                  <li>отказываться от рассылки рекламных предложений.</li>
                </ul>
              </>
            ),
          },
          {
            title: 'Обеспечение безопасности',
            content: <p>Мы принимаем меры для защиты данных от несанкционированного доступа, утраты или изменения, используя современные технологии шифрования и контроля доступа.</p>,
          },
          {
            title: 'Изменения политики',
            content: (
              <p>
                Настоящая политика может быть обновлена в любое время. Актуальная версия доступна на официальном сайте.
                Защита ваших данных — одна из важнейших составляющих нашей работы. Спасибо за выбор ювелирной студии{' '}
                <strong style={{ color: heading }}>ЯНИНА В</strong>.
              </p>
            ),
          },
        ].map(({ title, content }) => (
          <section key={title}>
            <h2 className="font-display text-xl font-semibold mb-3" style={{ color: heading }}>{title}</h2>
            {content}
          </section>
        ))}
      </div>
    </InfoPageLayout>
  );
}
