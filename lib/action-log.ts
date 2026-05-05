import { ActionRecord, FlagResult, Role } from "./types";

export function createActionRecord(input: {
  workingUser: string;
  workingUserId: string;
  role: Role;
  accountNumber?: string;
  siteNumber?: string;
  actionType: string;
  result: FlagResult;
  description: string;
  previewMode?: boolean;
}): ActionRecord {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    workingUser: input.workingUser,
    workingUserId: input.workingUserId,
    role: input.role,
    accountNumber: input.accountNumber,
    siteNumber: input.siteNumber,
    actionType: input.actionType,
    result: input.result,
    description: input.description,
    previewMode: Boolean(input.previewMode)
  };
}
