import type { PolicyMeta, PolicySection } from "@/content/policy-types";

export const refundPolicyMeta: PolicyMeta = {
  title: "Refund Policy",
  lastUpdated: "July 2, 2026",
  contactEmail: "hi@ailistify.com",
};

export const refundPolicySections: PolicySection[] = [
  {
    id: "introduction",
    title: "Introduction",
    content: [
      "At Ailistify, we are committed to providing high-quality digital listing and promotional services for AI tools and businesses. Please read this Refund Policy carefully before purchasing any of our services.",
    ],
  },
  {
    id: "digital-services",
    title: "1. Digital Services",
    content: [
      "All products and services offered by Ailistify are digital in nature, including but not limited to:",
    ],
    list: [
      "Basic AI Tool Listings",
      "Premium AI Tool Listings",
      "Featured Listings",
      "Homepage Promotions",
      "Sponsored Listings",
      "Other digital advertising and promotional services",
    ],
    subsections: [
      {
        title: "No physical products",
        content: [
          "As these are digital services, no physical products are shipped.",
        ],
      },
    ],
  },
  {
    id: "refund-eligibility",
    title: "2. Refund Eligibility",
    content: [
      "You may be eligible for a full refund under the following circumstances:",
    ],
    list: [
      "Your AI tool submission is rejected during our review process and is not published on Ailistify.",
      "We are unable to provide the purchased service due to a technical or operational issue on our end.",
      "A duplicate payment or accidental multiple charge has been made for the same order.",
    ],
    subsections: [
      {
        title: "Refund method",
        content: [
          "Approved refunds will be processed using the original payment method.",
        ],
      },
    ],
  },
  {
    id: "non-refundable-services",
    title: "3. Non-Refundable Services",
    content: ["Refunds will not be provided in the following situations:"],
    list: [
      "Your listing has been reviewed, approved, and published.",
      "Your featured or sponsored listing has already gone live.",
      "Promotional or advertising services have been delivered.",
      "You submitted incorrect, incomplete, or misleading information that affected the review process.",
      "You decide to cancel after your submission has been approved or the service has begun.",
      "You are dissatisfied with traffic, user engagement, conversions, sales, or business results, as these outcomes depend on multiple external factors beyond our control.",
    ],
  },
  {
    id: "listing-review",
    title: "4. Listing Review",
    content: [
      "Every AI tool submitted to Ailistify is manually reviewed to ensure it meets our quality standards and community guidelines.",
      "We reserve the right to reject any submission that:",
    ],
    list: [
      "Contains false or misleading information.",
      "Promotes illegal, harmful, or fraudulent services.",
      "Contains malware, viruses, or malicious software.",
      "Includes adult or prohibited content.",
      "Infringes on intellectual property rights.",
      "Does not align with the purpose and quality standards of the Ailistify directory.",
    ],
    subsections: [
      {
        title: "Rejected submissions",
        content: [
          "If your submission is rejected during this review process, you will be eligible for a full refund.",
        ],
      },
    ],
  },
  {
    id: "cancellation-policy",
    title: "5. Cancellation Policy",
    content: [
      "You may request to cancel your order before the review process begins.",
      "Once your submission has entered the review process or your listing has been published, cancellation requests may no longer be accepted.",
    ],
  },
  {
    id: "refund-processing",
    title: "6. Refund Processing",
    content: ["Once your refund request is approved:"],
    list: [
      "Refunds are typically processed within 5–10 business days.",
      "The credited amount may take additional time to appear in your account depending on your bank or payment provider.",
    ],
  },
  {
    id: "chargebacks",
    title: "7. Chargebacks",
    content: [
      "If you experience any issue with your purchase, we encourage you to contact our support team before initiating a chargeback with your payment provider.",
      "Fraudulent or abusive chargebacks may result in suspension or permanent restriction from using Ailistify's services.",
    ],
  },
  {
    id: "changes",
    title: "8. Changes to This Policy",
    content: [
      "We reserve the right to update or modify this Refund Policy at any time. Any changes will be posted on this page with the updated revision date.",
    ],
  },
  {
    id: "contact",
    title: "9. Contact Us",
    content: [
      `If you have any questions regarding this Refund Policy or would like to request a refund, please contact us at ${refundPolicyMeta.contactEmail}.`,
      "We aim to respond to all refund-related inquiries within 2 business days.",
    ],
  },
];
