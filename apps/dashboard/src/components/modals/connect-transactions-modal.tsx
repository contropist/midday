"use client";

import { track } from "@midday/events/client";
import { LogEvents } from "@midday/events/events";
import { Card, CardDescription, CardHeader, CardTitle } from "@midday/ui/card";
import { cn } from "@midday/ui/cn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@midday/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@midday/ui/tabs";
import Image from "next/image";
import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";
import CsvLogoDark from "public/assets/csv-dark.png";
import CsvLogo from "public/assets/csv.png";
import GoCardLessLogo from "public/assets/gocardless.png";
import PlaidLogo from "public/assets/plaid.png";
import TellerLogo from "public/assets/teller.png";
import ZapierLogo from "public/assets/zapier.png";
import { useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import {
  type TellerConnectOptions,
  useTellerConnect,
} from "teller-connect-react";

type Props = {
  isEU: boolean;
};

export function ConnectTransactionsModal({ isEU }: Props) {
  const [token, setToken] = useState();

  const [params, setParams] = useQueryStates({
    step: parseAsStringEnum(["connect", "account", "gocardless", "import-csv"]),
    ref: parseAsString,
    token: parseAsString,
    enrollment_id: parseAsString,
    institution_id: parseAsString,
    provider: parseAsStringEnum(["teller", "plaid", "gocardless"]),
  });

  const isOpen = params.step === "connect";

  useEffect(() => {
    async function createLinkToken() {
      const response = await fetch("/api/plaid/create-link-token", {
        method: "POST",
      });
      const { link_token } = await response.json();
      setToken(link_token);
    }

    if (isOpen) {
      createLinkToken();
    }
  }, [isOpen]);

  const { open: openTeller, ready: tellerReady } = useTellerConnect({
    applicationId: process.env.NEXT_PUBLIC_TELLER_APPLICATION_ID!,
    environment: process.env
      .NEXT_PUBLIC_TELLER_ENVIRONMENT as TellerConnectOptions["environment"],
    appearance: "system",
    onSuccess: (authorization) => {
      setParams({
        step: "account",
        provider: "teller",
        token: authorization.accessToken,
        enrollment_id: authorization.enrollment.id,
      });

      track({
        event: LogEvents.ConnectBankAuthorized.name,
        channel: LogEvents.ConnectBankAuthorized.channel,
        provider: "teller",
      });
    },
    onExit: () => {
      setParams({ step: "connect" });

      track({
        event: LogEvents.ConnectBankCanceled.name,
        channel: LogEvents.ConnectBankCanceled.channel,
        provider: "teller",
      });

      setParams({ step: "connect" });
    },
    onFailure: () => {
      setParams({ step: "connect" });
    },
  });

  const { open: openPlaid, ready: plaidReady } = usePlaidLink({
    token,
    publicKey: "",
    env: process.env.NEXT_PUBLIC_PLAID_ENVIRONMENT!,
    clientName: "Midday",
    product: ["transactions"],
    onSuccess: async (public_token, metadata) => {
      const response = await fetch("/api/plaid/exchange-public-token", {
        method: "POST",
        body: JSON.stringify({ public_token }),
      });

      const { access_token } = await response.json();

      setParams({
        step: "account",
        provider: "plaid",
        token: access_token,
        institution_id: metadata.institution?.institution_id,
      });

      track({
        event: LogEvents.ConnectBankAuthorized.name,
        channel: LogEvents.ConnectBankAuthorized.channel,
        provider: "plaid",
      });
    },
    onExit: () => {
      setParams({ step: "connect" });

      track({
        event: LogEvents.ConnectBankCanceled.name,
        channel: LogEvents.ConnectBankCanceled.channel,
        provider: "plaid",
      });
    },
  });

  const banks = [
    {
      id: "teller",
      name: "Teller (US)",
      description:
        "With Teller we can connect to  instantly with more than 5,000 financial institutions in the US.",
      logo: TellerLogo,
      onClick: () => {
        track({
          event: LogEvents.ConnectBankProvider.name,
          channel: LogEvents.ConnectBankProvider.channel,
          provider: "teller",
        });

        openTeller();
        setParams({ step: null });
      },
      disabled: !tellerReady,
    },
    {
      id: "plaid",
      name: "Plaid (US, Canada, UK, EU)",
      description: `12,000+ financial institutions across the US, Canada, UK, and Europe are covered by Plaid's network`,
      logo: PlaidLogo,
      onClick: () => {
        track({
          event: LogEvents.ConnectBankProvider.name,
          channel: LogEvents.ConnectBankProvider.channel,
          provider: "plaid",
        });

        openPlaid();
        setParams({ step: null });
      },
      disabled: !plaidReady || !token,
    },
    {
      id: "gocardless",
      name: "GoCardless (EU, UK)",
      description:
        "More than 2,500 connected banks in 31 countries across the UK and Europe.",
      logo: GoCardLessLogo,
      onClick: () => {
        track({
          event: LogEvents.ConnectBankProvider.name,
          channel: LogEvents.ConnectBankProvider.channel,
          provider: "gocardless",
        });

        setParams({ step: "gocardless" });
      },
    },
  ].sort((a, b) => {
    if (isEU && a.id === "gocardless") {
      return -1;
    }

    if (isEU && a.id === "plaid") {
      return -1;
    }

    return 0;
  });

  const imports = [
    {
      id: "csc",
      name: "CSV",
      description:
        "Import transactions using a CSV file, you can also use this for backfilling.",
      logo: CsvLogo,
      logoDark: CsvLogoDark,
      onClick: () => {
        setParams({ step: "import-csv" });
      },
    },
    {
      id: "zapier",
      name: "Zapier",
      description:
        "With 6,000+ apps you can automate your process of importing transactions from your bank. For example using a SpreadSheet.",
      logo: ZapierLogo,
      disabled: true,
    },
  ];

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() =>
        setParams(
          { step: null },
          {
            // NOTE: Rerender so the overview modal is visible
            shallow: false,
          }
        )
      }
    >
      <DialogContent>
        <div className="p-4">
          <DialogHeader>
            <DialogTitle>Connect Transactions</DialogTitle>
            <DialogDescription>
              We use various providers to support as many banks as possible. If
              you can't establish a connection, manual import is available as an
              alternative.
            </DialogDescription>
          </DialogHeader>
        </div>

        <Tabs defaultValue="banks" className="p-4 pt-0">
          <TabsList className="p-0 h-auto space-x-4 bg-transparent">
            <TabsTrigger className="p-0" value="banks">
              Banks
            </TabsTrigger>
            <TabsTrigger className="p-0" value="import">
              Import
            </TabsTrigger>
          </TabsList>

          <TabsContent value="banks" className="space-y-4 mt-4">
            {banks.map((bank) => {
              return (
                <Card key={bank.id}>
                  <button
                    type="button"
                    className="text-left"
                    onClick={bank.onClick}
                    disabled={bank.disabled}
                  >
                    <div className="flex space-x-2 items-center ml-4">
                      <div className="w-[40px] h-[40px] mt-[22px] self-start">
                        <Image
                          src={bank.logo}
                          width={40}
                          height={40}
                          alt={bank.name}
                          quality={100}
                        />
                      </div>

                      <CardHeader className="p-4 pl-2 flex-1">
                        <CardTitle className="text-md mb-0">
                          {bank.name}
                        </CardTitle>

                        <CardDescription className="text-sm">
                          {bank.description}
                        </CardDescription>
                      </CardHeader>
                    </div>
                  </button>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="import" className="space-y-4 mt-4">
            {imports.map((provider) => {
              return (
                <Card key={provider.id}>
                  <button
                    type="button"
                    className="text-left"
                    onClick={provider.onClick}
                    disabled={provider.disabled}
                  >
                    <div className="flex space-x-2 items-center ml-4">
                      <div
                        className={cn(
                          "w-[40px] h-[40px] mt-[22px] self-start",
                          provider.logoDark && "hidden dark:block"
                        )}
                      >
                        <Image
                          src={provider.logo}
                          width={40}
                          height={40}
                          alt={provider.name}
                          quality={100}
                        />
                      </div>

                      {provider.logoDark && (
                        <div className="mt-4 dark:hidden">
                          <Image
                            src={provider.logoDark}
                            width={40}
                            height={40}
                            alt={provider.name}
                            quality={100}
                          />
                        </div>
                      )}

                      <CardHeader className="p-4 pl-2 flex-1">
                        <div className="flex space-x-2">
                          <CardTitle className="text-md mb-0">
                            {provider.name}
                          </CardTitle>

                          {provider.disabled && (
                            <div className="text-[#878787] rounded-md py-1 px-2 border text-[10px]">
                              Coming soon
                            </div>
                          )}
                        </div>
                        <CardDescription className="text-sm">
                          {provider.description}
                        </CardDescription>
                      </CardHeader>
                    </div>
                  </button>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
