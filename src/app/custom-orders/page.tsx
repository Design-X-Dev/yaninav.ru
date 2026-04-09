import type { Metadata } from 'next';
import Link from 'next/link';
import InfoPageLayout from '@/components/InfoPageLayout';
import { THEME } from '@/utils/theme';

export const metadata: Metadata = {
  title: 'Индивидуальный заказ | ЯНИНА В',
  description:
    'Персональное ювелирное украшение в студии ЯНИНА В: заявка, эскизы, производство и контроль процесса вместе с вами.',
};

const { heading, text, bg } = THEME;

export default function CustomOrdersPage() {
  return (
    <InfoPageLayout>
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-8" style={{ color: heading }}>
        Индивидуальный заказ
      </h1>

      <div className="space-y-8 text-base leading-relaxed" style={{ color: text }}>
        <section>
          <p>
            Ювелирная студия <strong style={{ color: heading }}>ЯНИНА В</strong> представляет уникальную возможность
            воплотить в жизнь вашу мечту о персональном украшении. Мы предлагаем вам заказать создание эксклюзивных
            украшений, которые станут отражением вашей индивидуальности и стиля. Как это работает?
          </p>
        </section>

        <section className="space-y-6">
          {[
            { title: 'Оставьте заявку', body: 'Опишите вашу идею, приложите наброски или эскизы, расскажите нам о ваших пожеланиях.' },
            { title: 'Подбор варианта', body: 'Наши талантливые художники и дизайнеры предложат варианты дизайна, подходящие именно вам.' },
            { title: 'Создание эскизов', body: 'Вместе мы разработаем уникальные эскизы будущего украшения.' },
            { title: 'Производство', body: 'Опытные мастера-ювелиры воплотят ваше украшение в реальность, создавая изделие высочайшего качества.' },
            { title: 'Контроль процесса', body: 'Вы будете активно вовлечены в процесс создания, контролируя каждый этап производства.' },
          ].map(({ title, body }) => (
            <div key={title}>
              <h2 className="font-display text-lg font-semibold mb-2" style={{ color: heading }}>{title}</h2>
              <p>{body}</p>
            </div>
          ))}
        </section>

        <section>
          <p>
            Пришло время создать уникальное украшение, которое станет символом вашей неповторимости. Оставляйте заявку
            на индивидуальный заказ в студии <strong style={{ color: heading }}>ЯНИНА В</strong> и подарите себе радость
            обладания эксклюзивным украшением, созданным специально для вас.
          </p>
        </section>

        <section>
          <p>
            Условия изготовления, оплаты и гарантии соответствуют{' '}
            <Link href="/offer" className="text-accent-primary underline hover:no-underline">
              публичной оферте
            </Link>
            .
          </p>
        </section>

        <section className="pt-2">
          <Link
            href="/#contact-reach"
            className="inline-block rounded-full px-8 py-4 font-medium text-center transition-all duration-300 hover:opacity-90 shadow-lg"
            style={{ backgroundColor: heading, color: bg }}
          >
            Оставить заявку
          </Link>
        </section>
      </div>
    </InfoPageLayout>
  );
}
