import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LegalFooterDivider from '@/components/LegalFooterDivider';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности | ЯНИНА В',
  description:
    'Политика конфиденциальности ювелирной студии ЯНИНА В: сбор и использование персональных данных, ваши права и безопасность информации.',
};

const bg = '#f4f7f0';
const heading = '#59151f';
const text = '#616161';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: bg }}>
      <Header sectionColor={bg} />
      <article className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 md:py-16 pb-24">
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

          <section>
            <h2 className="font-display text-xl font-semibold mb-3" style={{ color: heading }}>
              Какие данные мы собираем?
            </h2>
            <p className="mb-3">Мы собираем следующую информацию:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>имя и контактные данные (телефон, e-mail);</li>
              <li>адрес доставки (при заказе товаров);</li>
              <li>данные банковских карт (шифруются и передаются платежным операторам);</li>
              <li>IP-адрес и cookie-файлы (для улучшения функционала сайта).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3" style={{ color: heading }}>
              Как мы используем собранные данные?
            </h2>
            <p>
              Собранные данные используются исключительно для исполнения обязательств перед клиентами, включая
              обработку заказов, предоставление консультаций и улучшение качества обслуживания.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3" style={{ color: heading }}>
              Ваши права
            </h2>
            <p className="mb-3">Пользователь вправе:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>получать информацию о собранных данных;</li>
              <li>требовать исправления или удаления неверных данных;</li>
              <li>отказываться от рассылки рекламных предложений.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3" style={{ color: heading }}>
              Обеспечение безопасности
            </h2>
            <p>
              Мы принимаем меры для защиты данных от несанкционированного доступа, утраты или изменения, используя
              современные технологии шифрования и контроля доступа.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3" style={{ color: heading }}>
              Изменения политики
            </h2>
            <p>
              Настоящая политика может быть обновлена в любое время. Актуальная версия доступна на официальном сайте.
              Защита ваших данных — одна из важнейших составляющих нашей работы. Спасибо за выбор ювелирной студии{' '}
              <strong style={{ color: heading }}>ЯНИНА В</strong>.
            </p>
          </section>
        </div>
      </article>
      <LegalFooterDivider />
      <Footer backgroundColor={bg} />
    </main>
  );
}
