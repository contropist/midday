import {
  BankAccountList,
  BankAccountListSkeleton,
} from "@/components/bank-account-list";
import { ConnectBankButton } from "@/components/connect-bank-button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@midday/ui/card";
import { Suspense } from "react";

export async function ConnectedAccounts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Accounts</CardTitle>
        <CardDescription>
          Manage bank accounts, update or connect new ones.
        </CardDescription>
      </CardHeader>

      <Suspense fallback={<BankAccountListSkeleton />}>
        <BankAccountList />
      </Suspense>

      <CardFooter className="flex justify-between">
        <div />

        <ConnectBankButton />
      </CardFooter>
    </Card>
  );
}
