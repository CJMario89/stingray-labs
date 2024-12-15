"use client";

import {
  ConnectModal,
  useAccounts,
  useCurrentAccount,
  useCurrentWallet,
  useDisconnectWallet,
  useSwitchAccount,
} from "@mysten/dapp-kit";
import { useEffect, useState } from "react";
import IconWallet from "./icons/wallet";
import IconCheck from "./icons/check";

export const formatAddress = (address?: string) =>
  `${address?.slice(0, 6)}...${address?.slice(-6)}`;

const ConnectButton = () => {
  const { mutate: switchAccount } = useSwitchAccount();
  const currentAccount = useCurrentAccount();
  const accounts = useAccounts();
  const { connectionStatus } = useCurrentWallet();

  const { mutate: disconnect } = useDisconnectWallet();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (accounts.length === 0) {
      disconnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionStatus, accounts]);
  return (
    <>
      {connectionStatus === "connected" ? (
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-outline m-1">
            <IconWallet />
            {formatAddress(currentAccount?.address)}
          </div>
          <ul
            tabIndex={0}
            className="menu dropdown-content z-[1] w-52 rounded-box border bg-base-200 p-2 shadow"
          >
            {accounts.map((account) => (
              <li key={account.address}>
                <button
                  className="btn btn-ghost w-full"
                  onClick={() => switchAccount({ account })}
                >
                  {account.address === currentAccount?.address && <IconCheck />}
                  {formatAddress(account.address)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ConnectModal
          trigger={
            <button
              disabled={!!currentAccount}
              className="btn btn-primary text-neutral-50"
            >
              {currentAccount ? currentAccount.address : "Connect Wallet"}
            </button>
          }
          open={open}
          onOpenChange={(isOpen) => setOpen(isOpen)}
        />
      )}
    </>
  );
};

export default ConnectButton;
