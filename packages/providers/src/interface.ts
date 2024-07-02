import type {
  GetAccountsRequest,
  GetAccountsResponse,
  GetTransactionsRequest,
  GetTransactionsResponse,
} from "./types";

export interface Provider {
  getTransactions: (
    params: GetTransactionsRequest
  ) => Promise<GetTransactionsResponse>;
  getAccounts: (params: GetAccountsRequest) => Promise<GetAccountsResponse>;
}
