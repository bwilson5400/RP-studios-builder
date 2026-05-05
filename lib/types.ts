export type Role = "seller" | "admin" | "supervisor" | "owner";

export type FlagResult = "green" | "red";

export type PackageKey = "starter" | "business" | "pro" | "premium";

export type ContractTerm = "month_to_month" | "12_month" | "36_month";

export type PreviewMode = {
  enabled: boolean;
  role?: "seller" | "admin";
  pin?: string;
};

export type ActionRecord = {
  id: string;
  timestamp: string;
  workingUser: string;
  workingUserId: string;
  role: Role;
  accountNumber?: string;
  siteNumber?: string;
  actionType: string;
  result: FlagResult;
  description: string;
  previewMode: boolean;
};

export type ClientAccount = {
  accountNumber: string;
  businessName: string;
  customerName: string;
  phone: string;
  email: string;
  industry: string;
  assignedSeller: string;
  status: "active" | "pending_setup" | "cancelled" | "draft";
};

export type Site = {
  siteNumber: string;
  accountNumber: string;
  name: string;
  packageKey: PackageKey;
  contractTerm: ContractTerm;
  status: "draft" | "preview_generated" | "building" | "live" | "mock_published";
};
