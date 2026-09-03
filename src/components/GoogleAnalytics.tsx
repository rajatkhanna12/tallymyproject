import Script from "next/script";

/**
 * Renders nothing unless NEXT_PUBLIC_GA_ID is set (in .env.local or your
 * hosting provider's env vars). To activate: create a GA4 property, copy
 * its Measurement ID (starts with "G-"), and set:
 *   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
 */
export default function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
