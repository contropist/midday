import type { AccountType } from "@midday/engine/src/utils/account";

export type Providers = "teller" | "plaid" | "gocardless";

export type ProviderParams = {
  provider: Providers;
  environment?: "development" | "staging" | "production";
};

export type Transaction = {
  amount: number;
  currency: string;
  date: string;
  internal_id: string;
  bank_account_id: string;
  team_id: string;
  status: "posted" | "pending";
  balance?: string | null;
  category?: string | null;
  method: string;
  name: string;
  description?: string | null;
  currency_rate?: number | null;
  currency_source?: string | null;
};

export type Institution = {
  id: string;
  name: string;
  logo?: string | null;
};

export type Account = {
  id: string;
  name: string;
  currency: string;
  provider: Providers;
  institution?: Institution;
  enrollment_id?: string; // Teller
  type: AccountType;
};

export type Balance = {
  amount: number;
  currency: string;
};

export type GetTransactionsRequest = {
  teamId: string;
  bankAccountId: string;
  accountType: AccountType;
  accountId: string;
  latest?: boolean;
  accessToken?: string; // Teller & Plaid
};

export type GetAccountsRequest = {
  id?: string; // GoCardLess
  countryCode?: string; // GoCardLess
  accessToken?: string; // Teller & Plaid
  institutionId?: string; // Plaid
};

export type GetAccountBalanceRequest = {
  accountId: string;
  accessToken?: string; // Teller & Plaid
};

export type GetTransactionsResponse = Transaction[];

export type GetAccountsResponse = Account[];
