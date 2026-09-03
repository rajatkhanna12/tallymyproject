import type { Metadata } from "next";
import { siteConfig } from "@/lib/calculators-data";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy policy for ${siteConfig.name} — how we handle data, cookies, and advertising.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <div className="prose-sm mt-8 max-w-none space-y-6 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Overview</h2>
          <p className="mt-2">
            {siteConfig.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) provides free
            calculators for home improvement projects. This policy explains
            what information we collect when you use the site, and how it is
            used. All calculators run entirely in your browser &mdash; the
            numbers you enter are never sent to or stored on our servers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">
            Information we collect
          </h2>
          <p className="mt-2">
            Like most websites, we use standard analytics tools (such as
            Google Analytics) to understand aggregate traffic &mdash; which
            pages are visited, how long visitors stay, and general location
            and device information. This data is anonymized and aggregated;
            it is not used to identify you personally.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">
            Cookies &amp; advertising
          </h2>
          <p className="mt-2">
            We use Google AdSense to display advertising on this site.
            Google and its partners may use cookies (including the
            DoubleClick cookie) to serve ads based on your prior visits to
            this and other websites. You can opt out of personalized
            advertising by visiting{" "}
            <a
              href="https://adssettings.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:underline"
            >
              Google Ads Settings
            </a>
            , or by visiting{" "}
            <a
              href="https://www.aboutads.info/choices/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:underline"
            >
              www.aboutads.info
            </a>{" "}
            to opt out of participating vendors&rsquo; use of cookies for
            personalized advertising.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">
            Third-party links
          </h2>
          <p className="mt-2">
            Pages on this site may link to third-party retailers, suppliers,
            or resources. We are not responsible for the privacy practices
            or content of external sites.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">
            Children&rsquo;s privacy
          </h2>
          <p className="mt-2">
            This site is not directed at children under 13, and we do not
            knowingly collect personal information from children.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">
            Changes to this policy
          </h2>
          <p className="mt-2">
            We may update this privacy policy from time to time. Changes
            will be posted on this page with an updated revision date.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900">
            Contact
          </h2>
          <p className="mt-2">
            Questions about this policy? Contact us at{" "}
            <a href="mailto:hello@tallymyproject.com" className="font-medium text-emerald-700 hover:underline">
              hello@tallymyproject.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
