import type { Metadata } from 'next';
import InfoPageLayout from '@/components/InfoPageLayout';
import { THEME } from '@/utils/theme';

export const metadata: Metadata = {
  title: 'Публичная оферта | ЯНИНА В',
  description:
    'Условия приобретения товаров и услуг ювелирной студии ЯНИНА В: публичная оферта, права сторон, оплата и возврат.',
};

const { heading, text } = THEME;

export default function OfferPage() {
  return (
    <InfoPageLayout showLegalDivider>
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-8" style={{ color: heading }}>
        Публичная оферта
      </h1>

      <div className="space-y-8 text-base leading-relaxed" style={{ color: text }}>
        <section>
          <p>
            Приведённый ниже документ устанавливает условия приобретения товаров и оказания услуг ювелирной студией{' '}
            <strong style={{ color: heading }}>ЯНИНА В</strong> через интернет-сайт и регулирует взаимоотношения между
            студией и покупателями.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold mb-3" style={{ color: heading }}>Основные понятия</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong style={{ color: heading }}>Продавец (исполнитель)</strong> — ювелирная студия ЯНИНА В.</li>
            <li><strong style={{ color: heading }}>Покупатель (заказчик)</strong> — физическое лицо, приобретающее товары или заказывающее услуги через сайт.</li>
            <li><strong style={{ color: heading }}>Заказ</strong> — заявление покупателя о намерении приобрести товар или услугу.</li>
            <li><strong style={{ color: heading }}>Оплата</strong> — денежное возмещение стоимости товара или услуги, произведённое покупателем.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold mb-3" style={{ color: heading }}>Предложение заключить договор</h2>
          <p>
            Данная публичная оферта признаётся предложением заключить договор купли-продажи или оказания услуг.
            Акцептом оферты является оформление заказа на сайте или личное обращение в студию.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold mb-3" style={{ color: heading }}>Права и обязанности продавца</h2>
          <p className="mb-3">Продавец обязуется:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>оказать качественные услуги по созданию ювелирных изделий на заказ;</li>
            <li>предоставить покупателю необходимую консультацию и помощь в подборе изделий;</li>
            <li>выполнить заказ в оговорённые сроки;</li>
            <li>обеспечить сохранность данных покупателей.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold mb-3" style={{ color: heading }}>Права и обязанности покупателя</h2>
          <p className="mb-3">Покупатель обязуется:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>правильно заполнить данные при оформлении заказа;</li>
            <li>своевременно произвести оплату;</li>
            <li>самостоятельно проверить полученный товар на предмет соответствия заявленным характеристикам.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold mb-3" style={{ color: heading }}>Цены и способы оплаты</h2>
          <p>
            Цены на товары и услуги размещены на сайте и могут меняться без предварительного уведомления. Покупатель
            оплачивает заказ одним из предложенных способов: банковской картой, электронными деньгами или иными
            способами, предусмотренными продавцом.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold mb-3" style={{ color: heading }}>Возврат и обмен товара</h2>
          <p>Возврат и обмен возможны в случаях, предусмотренных законом РФ.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold mb-3" style={{ color: heading }}>Ответственность сторон</h2>
          <p>
            За неисполнение условий настоящего договора стороны несут ответственность в рамках действующего
            законодательства РФ.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold mb-3" style={{ color: heading }}>Заключение</h2>
          <p>
            Оформляя заказ на сайте или обращаясь лично в нашу студию, покупатель соглашается с изложенными
            условиями публичной оферты и принимает на себя соответствующие обязательства.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold mb-3" style={{ color: heading }}>Реквизиты продавца</h2>
          <p className="mb-4"><strong style={{ color: heading }}>ИП Валентюкевич Янина Валентиновна</strong></p>
          <p className="mb-4">Руководитель: Валентюкевич Янина Валентиновна</p>
          <dl className="space-y-2 border border-black/10 rounded-lg p-4 bg-white/40">
            {[
              ['ИНН', '—'],
              ['ОГРНИП', '—'],
              ['Расчётный счёт', '—'],
              ['Корреспондентский счёт', '—'],
              ['Учреждение банка', '—'],
              ['БИК', '—'],
            ].map(([dt, dd]) => (
              <div key={dt} className="flex flex-col sm:flex-row sm:gap-4">
                <dt className="shrink-0 font-medium" style={{ color: heading }}>{dt}</dt>
                <dd>{dd}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm">
            Актуальные банковские реквизиты для оплаты можно уточнить у менеджера при оформлении заказа.
          </p>
        </section>
      </div>
    </InfoPageLayout>
  );
}
