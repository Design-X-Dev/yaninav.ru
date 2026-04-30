import type { Metadata } from 'next';
import Link from 'next/link';
import InfoPageLayout from '@/components/InfoPageLayout';
import { THEME } from '@/utils/theme';

export const metadata: Metadata = {
  title: 'Подарочный сертификат | ЯНИНА В',
  description:
    'Подарочный и электронный сертификат ювелирной студии ЯНИНА В: условия оферты, правила использования, оформление заказа.',
};

const { heading, text } = THEME;

export default function GiftCertificatePage() {
  return (
    <InfoPageLayout>
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-8" style={{ color: heading }}>
        Подарочный сертификат
      </h1>

      <div className="space-y-8 text-base leading-relaxed" style={{ color: text }}>
        <section>
          <p>
            Подарочный сертификат ювелирной студии <strong style={{ color: heading }}>ЯНИНА В</strong> — это
            возможность подарить близким выбор уникального украшения или услуги: помолвочное или обручальное кольцо,
            персональный заказ, консультацию у мастера — на сумму, которую вы заранее определяете.
          </p>
          <p className="mt-4">
            <Link href="#gift-certificate-offer" className="text-accent-primary underline hover:no-underline">
              Оферта при покупке электронного подарочного сертификата
            </Link>{' '}
            — полный текст условий ниже на этой странице.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold mb-3" style={{ color: heading }}>Как это работает</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>вы выбираете номинал сертификата (сумма согласуется с менеджером);</li>
            <li>мы оформляем сертификат — бумажный или электронный, в зависимости от ваших пожеланий;</li>
            <li>получатель в удобное время посещает студию или связывается с нами и использует сертификат при покупке или заказе изделия в пределах номинала;</li>
            <li>условия срока действия и использования оговариваются при покупке сертификата.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold mb-3" style={{ color: heading }}>На что можно потратить</h2>
          <p>
            Сертификат распространяется на изделия из ассортимента студии и на индивидуальные заказы в рамках
            указанной суммы. Если стоимость выбранного украшения превышает номинал, возможна доплата разницы по
            согласованию.
          </p>
        </section>

        <section>
          <p>
            Чтобы купить подарочный сертификат или уточнить детали, свяжитесь с нами —{' '}
            <Link href="/#contact-reach" className="text-accent-primary underline hover:no-underline">
              контакты и форма обратной связи
            </Link>
            .
          </p>
        </section>

        <section id="gift-certificate-offer" className="scroll-mt-24 pt-4 border-t border-black/10">
          <h2 className="font-display text-2xl font-semibold mb-4" style={{ color: heading }}>
            Оферта при покупке электронного подарочного сертификата
          </h2>
          <p className="mb-6">
            Уважаемые покупатели! Электронный подарочный сертификат ювелирной студии{' '}
            <strong style={{ color: heading }}>ЯНИНА В</strong> предоставляется покупателям в электронном виде и
            предназначен для приобретения ювелирных изделий или услуг студии.
          </p>

          {[
            {
              title: 'Предложение оферты',
              content: <p>Ювелирная студия <strong style={{ color: heading }}>ЯНИНА В</strong> настоящим предлагает принять данное предложение (оферту) и оформить электронный подарочный сертификат на условиях, указанных ниже.</p>,
            },
            {
              title: 'Определение понятий',
              content: (
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong style={{ color: heading }}>Электронный подарочный сертификат</strong> — цифровой файл, содержащий уникальный идентификационный код, предназначенный для совершения покупок в студии.</li>
                  <li><strong style={{ color: heading }}>Получатель подарка</strong> — лицо, указанное владельцем сертификата в качестве бенефициара.</li>
                  <li><strong style={{ color: heading }}>Срок действия сертификата</strong> — период, в течение которого возможно использование сертификата для приобретения товаров или услуг.</li>
                </ul>
              ),
            },
            {
              title: 'Правила использования сертификата',
              content: (
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Электронный подарочный сертификат активируется автоматически сразу после оформления заказа.</li>
                  <li>Сертификат действителен в течение указанного периода (обычно 12 месяцев с момента активации).</li>
                  <li>Сертификат можно подарить другому лицу, передав уникальный код.</li>
                  <li>Приобретённые сертификаты не возвращаются и не обмениваются на денежные средства.</li>
                  <li>Стоимость сертификатов фиксированная и не подлежит изменениям после покупки.</li>
                </ol>
              ),
            },
          ].map(({ title, content }) => (
            <div key={title} className="mb-6">
              <h3 className="font-display text-lg font-semibold mb-2" style={{ color: heading }}>{title}</h3>
              {content}
            </div>
          ))}

          <h3 className="font-display text-lg font-semibold mb-2" style={{ color: heading }}>Оформление заказа</h3>
          <p className="mb-3">При приобретении электронного подарочного сертификата необходимо указать:</p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>сумму сертификата;</li>
            <li>e-mail владельца сертификата;</li>
            <li>фамилию и имя получателя подарка (если подарок предназначается третьему лицу).</li>
          </ul>
          <p>
            Если у вас остались вопросы, обращайтесь через{' '}
            <Link href="/#contact-reach" className="text-accent-primary underline hover:no-underline">
              контакты на сайте
            </Link>
            . Спасибо за внимание и приятных покупок!
          </p>
        </section>
      </div>
    </InfoPageLayout>
  );
}
