import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LegalFooterDivider from '@/components/LegalFooterDivider';

export const metadata: Metadata = {
  title: 'Гарантии | ЯНИНА В',
  description:
    'Гарантии ювелирной студии ЯНИНА В: качество материалов, профессионализм мастеров, индивидуальный подход и сертификаты подлинности.',
};

const bg = '#f4f7f0';
const heading = '#59151f';
const text = '#616161';

export default function WarrantyPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: bg }}>
      <Header sectionColor={bg} />
      <article className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 md:py-16 pb-24">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-8" style={{ color: heading }}>
          Гарантии
        </h1>

        <div className="space-y-8 text-base leading-relaxed" style={{ color: text }}>
          <section>
            <p>
              Мы заботимся о каждом нашем клиенте и гарантируем высокое качество наших изделий и услуг. Ювелирная студия{' '}
              <strong style={{ color: heading }}>ЯНИНА В</strong> стремится обеспечить надёжность, долговечность и эстетику
              каждого изделия, предлагая нашим клиентам уверенность в своём выборе.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-4" style={{ color: heading }}>
              Что гарантирует наша студия?
            </h2>
            <ul className="list-disc pl-6 space-y-4">
              <li>
                <strong style={{ color: heading }}>Качество материалов:</strong> используем только драгоценные металлы и
                камни высокого класса, прошедшие строгий контроль качества.
              </li>
              <li>
                <strong style={{ color: heading }}>Профессионализм мастеров:</strong> работа выполняется опытными
                специалистами, обладающими многолетним опытом и высокими профессиональными навыками.
              </li>
              <li>
                <strong style={{ color: heading }}>Индивидуальный подход:</strong> каждое изделие создаётся с учётом
                индивидуальных пожеланий клиента, обеспечивая уникальный дизайн и стиль.
              </li>
              <li>
                <strong style={{ color: heading }}>Исправление дефектов:</strong> предоставляем гарантию на устранение
                производственных дефектов в течение установленного срока эксплуатации.
              </li>
              <li>
                <strong style={{ color: heading }}>Сертификаты подлинности:</strong> все наши изделия сопровождаются
                сертификатами подлинности, подтверждающими происхождение камней и металлов.
              </li>
            </ul>
          </section>

          <section>
            <p>
              Ваш комфорт и удовлетворение результатом являются приоритетом для нас. Мы гордимся каждым изделием,
              вышедшим из-под рук наших мастеров, и уверены, что оно прослужит долгие годы, радуя вас своей красотой и
              изысканностью.
            </p>
          </section>
        </div>
      </article>
      <LegalFooterDivider />
      <Footer backgroundColor={bg} />
    </main>
  );
}
