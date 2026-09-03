export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Renders an FAQ list AND injects FAQPage JSON-LD structured data so pages
 * are eligible for FAQ rich results in Google Search.
 */
export default function FaqSection({ items }: { items: FaqItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-xl font-semibold text-slate-900">
        Frequently asked questions
      </h2>
      <div className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {items.map((item) => (
          <details key={item.question} className="group p-4">
            <summary className="cursor-pointer list-none font-medium text-slate-900 marker:content-none">
              <span className="flex items-center justify-between gap-4">
                {item.question}
                <span className="text-slate-500 transition-transform group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
