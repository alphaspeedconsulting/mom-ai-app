export function StructuredData() {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Alpha.Mom",
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    description:
      "AI-powered family assistant with 8 specialized agents for calendar management, grocery lists, budget tracking, school events, and more.",
    offers: [
      {
        "@type": "Offer",
        name: "Family",
        price: "7.99",
        priceCurrency: "USD",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          billingDuration: "P1M",
        },
      },
      {
        "@type": "Offer",
        name: "Family Pro",
        price: "14.99",
        priceCurrency: "USD",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          billingDuration: "P1M",
        },
      },
    ],
    creator: {
      "@type": "Organization",
      name: "AlphaSpeed AI",
      url: "https://alphaspeedai.com",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
    />
  );
}
