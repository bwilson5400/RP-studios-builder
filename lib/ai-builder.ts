export type AiActionDisclosure = {
  title: string;
  action: string;
  reason: string;
  costImpact: string;
  confirmationRequired: boolean;
};

export function disclosePaidAction(feature: string): AiActionDisclosure {
  const lower = feature.toLowerCase();

  if (lower.includes("chatbot")) {
    return {
      title: "AI Chatbot Add-On",
      action: "Add the AI chatbot feature to the order.",
      reason: "This feature needs setup, configuration, and ongoing support.",
      costImpact: "$75 setup and $25/month unless already included.",
      confirmationRequired: true
    };
  }

  if (lower.includes("store")) {
    return {
      title: "Online Store Add-On",
      action: "Add store pages and checkout structure to the order.",
      reason: "Stores need product setup, checkout setup, and extra management.",
      costImpact: "$150 setup and $50/month.",
      confirmationRequired: true
    };
  }

  if (lower.includes("domain")) {
    return {
      title: "Managed Domain",
      action: "Add a managed domain to the order.",
      reason: "Managed domains include connection, DNS support, and renewal tracking.",
      costImpact: "$0 setup and $10/month per domain.",
      confirmationRequired: true
    };
  }

  return {
    title: "Action Confirmation",
    action: "Apply the requested builder change.",
    reason: "The builder confirms all changes before applying them.",
    costImpact: "No added cost detected.",
    confirmationRequired: true
  };
}

export function buildConfirmationMessage(request: string) {
  const disclosure = disclosePaidAction(request);
  return {
    ...disclosure,
    sellerMessage: `Here is what I am going to do: ${disclosure.action}\n\nReasoning: ${disclosure.reason}\n\nCost impact: ${disclosure.costImpact}\n\nDo you want me to proceed?`
  };
}
