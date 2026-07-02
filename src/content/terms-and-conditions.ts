import type { PolicyMeta, PolicySection } from "@/content/policy-types";

export const termsAndConditionsMeta: PolicyMeta = {
  title: "Terms & Conditions",
  lastUpdated: "July 2, 2026",
  contactEmail: "hi@ailistify.com",
};

export const termsAndConditionsSections: PolicySection[] = [
  {
    id: "introduction",
    title: "Introduction",
    content: [
      'Welcome to Ailistify ("Ailistify", "we", "our", or "us"). These Terms and Conditions govern your use of our website and services available at https://www.ailistify.com.',
      "By accessing or using our website, you agree to comply with these Terms.",
    ],
  },
  {
    id: "about",
    title: "1. About Ailistify",
    content: [
      "Ailistify is an online directory that helps users discover AI tools, software, and AI-powered products. We also provide paid listing, promotional, advertising, and featured placement services for AI businesses.",
    ],
  },
  {
    id: "eligibility",
    title: "2. Eligibility",
    content: [
      "You must be at least 18 years old or have legal authority to enter into these Terms.",
      "By using our services, you confirm that all information you provide is accurate and complete.",
    ],
  },
  {
    id: "paid-listings",
    title: "3. Paid Listings",
    content: [
      "Businesses may purchase listing or promotional services through Ailistify.",
      "Purchasing a listing does not guarantee:",
    ],
    list: [
      "Approval of the submitted tool",
      "Specific traffic",
      "Sales",
      "User engagement",
      "Search engine rankings",
      "Business growth",
    ],
    subsections: [
      {
        title: "Review process",
        content: ["Each submission is reviewed before publication."],
      },
    ],
  },
  {
    id: "listing-approval",
    title: "4. Listing Approval",
    content: [
      "We reserve the right to reject, remove, or suspend any submission that:",
    ],
    list: [
      "Contains misleading information",
      "Violates applicable laws",
      "Promotes illegal services",
      "Includes malware or harmful software",
      "Contains adult or NSFW content",
      "Is another AI directory or listing website",
      "Violates intellectual property rights",
    ],
    subsections: [
      {
        title: "Approval decisions",
        content: ["Approval decisions are made solely at our discretion."],
      },
    ],
  },
  {
    id: "listing-accuracy",
    title: "5. Listing Accuracy",
    content: [
      "You are responsible for ensuring that all submitted information remains accurate.",
      "We may edit formatting, descriptions, categories, or images to maintain consistency across the directory.",
    ],
  },
  {
    id: "payments",
    title: "6. Payments",
    content: [
      "All payments are processed securely through our authorized payment partners.",
      "Prices displayed on our website are subject to change without prior notice.",
      "Taxes, if applicable, will be charged during checkout.",
    ],
  },
  {
    id: "intellectual-property",
    title: "7. Intellectual Property",
    content: [
      "All website content, branding, graphics, logos, layouts, and original content belong to Ailistify unless otherwise stated.",
      "You retain ownership of your submitted trademarks, logos, and product information.",
      "By submitting content, you grant Ailistify a non-exclusive license to display, publish, promote, and distribute your listing.",
    ],
  },
  {
    id: "user-responsibilities",
    title: "8. User Responsibilities",
    content: ["You agree not to:"],
    list: [
      "Upload malicious software",
      "Submit false information",
      "Attempt unauthorized access",
      "Copy website content without permission",
      "Abuse or interfere with our services",
    ],
  },
  {
    id: "third-party-services",
    title: "9. Third-Party Services",
    content: [
      "Our directory contains links to third-party websites.",
      "We are not responsible for:",
    ],
    list: [
      "Third-party content",
      "Products",
      "Services",
      "Privacy practices",
      "Website availability",
    ],
    subsections: [
      {
        title: "Third-party access",
        content: ["Users access third-party websites at their own risk."],
      },
    ],
  },
  {
    id: "limitation-of-liability",
    title: "10. Limitation of Liability",
    content: [
      'Ailistify provides its services on an "as available" basis.',
      "We do not guarantee uninterrupted availability, error-free operation, or specific business outcomes from using our services.",
      "To the maximum extent permitted by law, Ailistify shall not be liable for indirect, incidental, consequential, or special damages arising from the use of our platform.",
    ],
  },
  {
    id: "account-suspension",
    title: "11. Account Suspension",
    content: [
      "We reserve the right to suspend or terminate accounts that violate these Terms without prior notice.",
    ],
  },
  {
    id: "changes-to-services",
    title: "12. Changes to Services",
    content: [
      "We may modify, discontinue, or improve any feature or service at any time.",
    ],
  },
  {
    id: "changes-to-terms",
    title: "13. Changes to These Terms",
    content: [
      "These Terms may be updated periodically.",
      "Continued use of the website constitutes acceptance of the revised Terms.",
    ],
  },
  {
    id: "governing-law",
    title: "14. Governing Law",
    content: [
      "These Terms shall be governed by the laws of India.",
      "Any disputes shall be subject to the jurisdiction of the courts located in Hyderabad, Telangana, India.",
    ],
  },
  {
    id: "contact",
    title: "15. Contact",
    content: [
      "For questions regarding these Terms, please contact us through the contact form available on our website.",
      `You may also reach us by email at ${termsAndConditionsMeta.contactEmail}.`,
    ],
  },
];
