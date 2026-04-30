import type { Metadata } from 'next';
import InfoPageLayout from '@/components/InfoPageLayout';
import { THEME } from '@/utils/theme';

export const metadata: Metadata = {
  title: 'Гарантии | ЯНИНА В',
  description:
    'Гарантии ювелирной студии ЯНИНА В: качество материалов, профессионализм мастеров, индивидуальный подход и сертификаты подлинности.',
};

const { heading, text } = THEME;

export default function WarrantyPage() {
  return (
    <InfoPageLayout showLegalDivider>
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
            {[
              { title: 'Качество материалов', body: 'используем только драгоценные металлы и камни высокого класса, прошедшие строгий контроль качества.' },
              { title: 'Профессионализм мастеров', body: 'работа выполняется опытными специалистами, обладающими многолетним опытом и высокими профессиональными навыками.' },
              { title: 'Индивидуальный подход', body: 'каждое изделие создаётся с учётом индивидуальных пожеланий клиента, обеспечивая уникальный дизайн и стиль.' },
              { title: 'Исправление дефектов', body: 'предоставляем гарантию на устранение производственных дефектов в течение установленного срока эксплуатации.' },
              { title: 'Сертификаты подлинности', body: 'все наши изделия сопровождаются сертификатами подлинности, подтверждающими происхождение камней и металлов.' },
            ].map(({ title, body }) => (
              <li key={title}>
                <strong style={{ color: heading }}>{title}:</strong> {body}
              </li>
            ))}
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
    </InfoPageLayout>
  );
}
