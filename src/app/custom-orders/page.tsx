import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Индивидуальный заказ | ЯНИНА В',
  description:
    'Персональное ювелирное украшение в студии ЯНИНА В: заявка, эскизы, производство и контроль процесса вместе с вами.',
};

const bg = '#f4f7f0';
const heading = '#59151f';
const text = '#616161';

export default function CustomOrdersPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: bg }}>
      <Header sectionColor={bg} />
      <article className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 md:py-16 pb-24">
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
            <div>
              <h2 className="font-display text-lg font-semibold mb-2" style={{ color: heading }}>
                Оставьте заявку
              </h2>
              <p>
                Опишите вашу идею, приложите наброски или эскизы, расскажите нам о ваших пожеланиях.
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold mb-2" style={{ color: heading }}>
                Подбор варианта
              </h2>
              <p>
                Наши талантливые художники и дизайнеры предложат варианты дизайна, подходящие именно вам.
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold mb-2" style={{ color: heading }}>
                Создание эскизов
              </h2>
              <p>Вместе мы разработаем уникальные эскизы будущего украшения.</p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold mb-2" style={{ color: heading }}>
                Производство
              </h2>
              <p>
                Опытные мастера-ювелиры воплотят ваше украшение в реальность, создавая изделие высочайшего качества.
              </p>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold mb-2" style={{ color: heading }}>
                Контроль процесса
              </h2>
              <p>
                Вы будете активно вовлечены в процесс создания, контролируя каждый этап производства.
              </p>
            </div>
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
      </article>
      <Footer backgroundColor={bg} />
    </main>
  );
}
