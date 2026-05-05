import { ContractTerm, PackageKey } from "./types";

export type PackagePricing = {
  name: string;
  setup: number;
  terms: Partial<Record<ContractTerm, number>>;
  description: string;
  included: string[];
};

export const cancellationFee = 350;
export const buyerRemorseFee = 50;

export const packages: Record<PackageKey, PackagePricing> = {
  starter: {
    name: "Starter Site",
    setup: 249,
    description: "Simple local business website.",
    terms: {
      "36_month": 99,
      "12_month": 119,
      "month_to_month": 129
    },
    included: ["1–5 pages", "Contact form", "Basic SEO", "Hosting"]
  },
  business: {
    name: "Business Website",
    setup: 499,
    description: "Most popular website package for local businesses.",
    terms: {
      "36_month": 199,
      "12_month": 249,
      "month_to_month": 279
    },
    included: ["Up to 10 pages", "Gallery", "Google Business link", "Analytics", "Reviews"]
  },
  pro: {
    name: "Pro Site",
    setup: 799,
    description: "Growth site with booking, chatbot, blog, and lead capture.",
    terms: {
      "36_month": 249,
      "12_month": 299
    },
    included: ["Booking", "Blog", "AI chatbot", "Lead capture", "Advanced SEO"]
  },
  premium: {
    name: "Premium / PWA",
    setup: 999,
    description: "App-like business website/PWA system.",
    terms: {
      "36_month": 399
    },
    included: ["PWA", "Custom features", "Automation", "Priority support", "Client dashboard"]
  }
};

export const addOns = [
  { key: "managed_domain", name: "Managed Domain", setup: 0, monthly: 10, contract: "1 year", cancellationFee: 35 },
  { key: "booking", name: "Booking System", setup: 100, monthly: 25 },
  { key: "blog", name: "Blog Module", setup: 50, monthly: 15 },
  { key: "ai_chatbot", name: "AI Chatbot", setup: 75, monthly: 25 },
  { key: "analytics_plus", name: "Analytics+", setup: 0, monthly: 20 },
  { key: "online_store", name: "Online Store", setup: 150, monthly: 50 },
  { key: "priority_support", name: "Priority Support", setup: 0, monthly: 25 },
  { key: "monthly_updates", name: "Monthly Site Updates", setup: 0, monthly: 50 }
];

export function getBusinessPromo(term: ContractTerm) {
  if (term === "36_month") {
    return {
      monthly: 175,
      setup: 349,
      labels: ["36-Month Bundle Savings", "$150 setup discount", "Free managed domain"]
    };
  }

  if (term === "12_month") {
    return {
      monthly: 199,
      setup: 499,
      labels: ["Intro 12-Month Business Promo"]
    };
  }

  return null;
}

export function calculatePackagePrice(packageKey: PackageKey, term: ContractTerm, usePromo = true) {
  const selected = packages[packageKey];
  const baseMonthly = selected.terms[term];

  if (!baseMonthly) {
    throw new Error(`${selected.name} does not support ${term}`);
  }

  if (packageKey === "business" && usePromo) {
    const promo = getBusinessPromo(term);
    if (promo) {
      return {
        setup: promo.setup,
        monthly: promo.monthly,
        baseMonthly,
        promoLabels: promo.labels
      };
    }
  }

  return {
    setup: selected.setup,
    monthly: baseMonthly,
    baseMonthly,
    promoLabels: []
  };
}
