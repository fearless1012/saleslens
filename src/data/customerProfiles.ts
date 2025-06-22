export const exampleCustomerProfiles = [
  {
    title: "Tech Startup - CTO",
    profile:
      "Sarah Chen is the CTO of a fast-growing fintech startup with 50 employees. The company processes $10M in transactions monthly but struggles with data analytics and customer insights. They currently use basic analytics tools and spreadsheets. Sarah is technically savvy, budget-conscious, and needs a solution that can scale with their rapid growth. She's looking for better customer behavior analytics to reduce churn and improve user experience. Decision timeline is 2-3 months.",
    industryFocus: "Technology",
    pitchType: "discovery" as const,
    products: ["Customer Analytics Suite", "Churn Prediction AI"],
  },
  {
    title: "Retail Chain - Operations Director",
    profile:
      "Mike Rodriguez is the Operations Director at a regional retail chain with 25 stores and $50M annual revenue. They're losing customers to online competitors and can't understand why foot traffic is declining. Current systems are outdated and don't provide real-time insights. Mike needs to prove ROI to the board and is looking for solutions that can show immediate impact. He's interested in understanding customer journey and optimizing store layouts.",
    industryFocus: "Retail",
    pitchType: "demo" as const,
    products: [
      "Retail Analytics Platform",
      "Customer Journey Mapping",
      "Store Optimization Tools",
    ],
  },
  {
    title: "Healthcare System - IT Director",
    profile:
      "Dr. Amanda Foster is the IT Director at a healthcare system with 3 hospitals and 200+ providers. They need to improve patient satisfaction scores and operational efficiency. Current data is siloed across different systems. Amanda is focused on HIPAA compliance and patient privacy. She's looking for analytics that can help predict patient needs and improve care quality while ensuring regulatory compliance.",
    industryFocus: "Healthcare",
    pitchType: "proposal" as const,
    products: [
      "Healthcare Analytics Suite",
      "Patient Experience Platform",
      "Predictive Care Analytics",
    ],
  },
  {
    title: "Manufacturing Company - VP Operations",
    profile:
      "James Liu is VP of Operations at a mid-sized manufacturing company producing automotive parts. They supply to major OEMs and need better demand forecasting and quality analytics. Currently struggling with inventory optimization and production planning. James is results-oriented and needs solutions that directly impact the bottom line. He's looking for predictive analytics to reduce waste and improve efficiency.",
    industryFocus: "Manufacturing",
    pitchType: "closing" as const,
    products: [
      "Manufacturing Analytics",
      "Demand Forecasting AI",
      "Quality Control Analytics",
    ],
  },
];

export const pitchTypeDescriptions = {
  discovery: "Initial conversation to understand customer needs and challenges",
  demo: "Product demonstration focused on specific customer requirements",
  proposal:
    "Formal presentation of solution with pricing and implementation details",
  closing: "Final discussion to secure commitment and next steps",
};
