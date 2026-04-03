import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Доставка и оплата | ЯНИНА В',
  description:
    'Условия доставки и оплаты ювелирных изделий студии ЯНИНА В: самовывоз в Екатеринбурге, отправка по России, способы оплаты.',
};

const bg = '#f4f7f0';
const heading = '#59151f';
const text = '#616161';

export default function DeliveryPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: bg }}>
      <Header sectionColor={bg} />
      <article className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 md:py-16 pb-24">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-8" style={{ color: heading }}>
          Доставка и оплата
        </h1>

        <div className="space-y-8 text-base leading-relaxed" style={{ color: text }}>
          <section>
            <p>
              Ниже — общие условия доставки и оплаты заказов ювелирной студии{' '}
              <strong style={{ color: heading }}>ЯНИНА В</strong>. Точные сроки, стоимость доставки и способ оплаты
              согласуются с менеджером при оформлении заказа.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3" style={{ color: heading }}>
              Самовывоз
            </h2>
            <p>
              Вы можете забрать готовое изделие в студии в Екатеринбурге по адресу: ул. Белинского, 41. Режим работы
              уточняйте по телефону или при записи на встречу. Передача изделия осуществляется после согласования
              комплектации и оплаты (если не предусмотрена предоплата иначе).
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3" style={{ color: heading }}>
              Способы оплаты
            </h2>
            <p className="mb-3">
              Оплатить ювелирные изделия в ювелирной студии <strong style={{ color: heading }}>ЯНИНА В</strong> можно
              следующими способами:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>банковская карта онлайн;</li>
              <li>иные способы по согласованию с менеджером.</li>
            </ul>
            <p className="mt-4">
              Все онлайн-платежи обрабатываются надёжно и безопасно через защищённую платёжную систему. Условия
              предоплаты, рассрочки или полной оплаты до/после изготовления зависят от сложности изделия и оговариваются
              при оформлении. Актуальные цены на изделия и услуги указаны на сайте и могут меняться; итоговая сумма
              фиксируется в заказе.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3" style={{ color: heading }}>
              Доставка по России
            </h2>
            <p className="mb-4">
              Доставка ювелирных изделий осуществляется специализированными транспортными компаниями, имеющими
              необходимые разрешения для перевозки ценностей. Это позволяет гарантировать максимальную защиту ваших
              покупок. Отправка в другие города возможна через надёжные службы; детали по страхованию и отслеживанию
              отправления согласуются индивидуально.
            </p>
            <h3 className="font-display text-lg font-semibold mb-2" style={{ color: heading }}>
              Срок доставки
            </h3>
            <p className="mb-3">
              Стандартный срок доставки составляет от 1 до 5 рабочих дней — в зависимости от выбранного тарифа
              транспортной компании и способа получения:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>
                до пункта выдачи (ПВЗ): выберите удобный пункт самовывоза рядом с домом или офисом;
              </li>
              <li>курьерская доставка: получите посылку непосредственно в руки курьером.</li>
            </ul>
            <p>
              Безопасность и своевременность доставки — наш приоритет. Мы обеспечиваем тщательную упаковку и надёжную
              транспортировку, чтобы ваша покупка прибыла в целости и сохранности.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3" style={{ color: heading }}>
              Документы и гарантии
            </h2>
            <p>
              К изделиям при необходимости выдаются сертификаты и сопроводительные документы. Общие гарантийные условия
              описаны на странице{' '}
              <Link href="/warranty" className="text-accent-primary underline hover:no-underline">
                «Гарантии»
              </Link>
              ; юридические условия покупки — в{' '}
              <Link href="/offer" className="text-accent-primary underline hover:no-underline">
                публичной оферте
              </Link>
              .
            </p>
          </section>

          <section className="pt-2">
            <p>
              Остались вопросы? Напишите или позвоните —{' '}
              <Link href="/#contact-reach" className="text-accent-primary underline hover:no-underline">
                контакты студии
              </Link>
              .
            </p>
          </section>
        </div>
      </article>
      <Footer backgroundColor={bg} />
    </main>
  );
}
