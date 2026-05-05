import { ActionRecord, ClientAccount, Site } from "./types";

export const currentUser = {
  name: "Brayden Wilson",
  username: "seller.bwilson",
  id: "usr_seller_102",
  role: "seller" as const
};

export const clients: ClientAccount[] = [
  {
    accountNumber: "48291736",
    businessName: "John’s Barber Shop",
    customerName: "John Smith",
    phone: "(205) 555-0181",
    email: "john@johnsbarber.com",
    industry: "Barber / Salon",
    assignedSeller: "Brayden Wilson",
    status: "active"
  },
  {
    accountNumber: "29105844",
    businessName: "Elite Cuts",
    customerName: "Marcus Reed",
    phone: "(205) 555-0142",
    email: "owner@elitecuts.com",
    industry: "Barber / Salon",
    assignedSeller: "Brayden Wilson",
    status: "pending_setup"
  }
];

export const sites: Site[] = [
  {
    siteNumber: "839274615203",
    accountNumber: "48291736",
    name: "Main Website",
    packageKey: "business",
    contractTerm: "36_month",
    status: "live"
  },
  {
    siteNumber: "982104762155",
    accountNumber: "48291736",
    name: "Booking Landing Page",
    packageKey: "starter",
    contractTerm: "month_to_month",
    status: "draft"
  }
];

export const actionRecords: ActionRecord[] = [
  {
    id: "act_001",
    timestamp: "2026-05-05T15:42:00.000Z",
    workingUser: "seller.bwilson",
    workingUserId: "usr_seller_102",
    role: "seller",
    accountNumber: "48291736",
    siteNumber: "839274615203",
    actionType: "Promo Applied",
    result: "green",
    description: "Business 36-month promo applied: $175/mo and $349 setup.",
    previewMode: false
  },
  {
    id: "act_002",
    timestamp: "2026-05-05T15:44:00.000Z",
    workingUser: "seller.bwilson",
    workingUserId: "usr_seller_102",
    role: "seller",
    accountNumber: "48291736",
    actionType: "PIN Reveal Attempt",
    result: "red",
    description: "PIN reveal denied because SMS verification was not completed.",
    previewMode: false
  },
  {
    id: "act_003",
    timestamp: "2026-05-05T15:51:00.000Z",
    workingUser: "admin.rpe",
    workingUserId: "usr_admin_001",
    role: "admin",
    accountNumber: "48291736",
    siteNumber: "839274615203",
    actionType: "Admin Override Access",
    result: "green",
    description: "Admin override used to access client account.",
    previewMode: false
  }
];
