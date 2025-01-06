import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { headerGradient } from "./header";
import TraderInfo from "@/common/trader-info";
import { useCurrentAccount } from "@mysten/dapp-kit";
import ConnectButton from "@/components/connect-button";
import { primaryGradient } from "@/components/pool-list-template";
import { useEffect, useState } from "react";

const linksMap = [
  {
    title: "Stingray Pools",
    href: "/stingray-pools",
    mode: "investor",
  },
  // {
  //   title: "Protocol Status",
  //   href: "/protocol-status",
  // },
  {
    title: "Sting Points",
    href: "/sting-points",
    isComingSoon: true,
    mode: "investor",
  },
  {
    title: "My Profolio",
    href: "/profolio",
    mode: "investor",
  },
  {
    title: "Sponsor Pools",
    href: "/sponsor-pools",
    mode: "investor",
  },
  {
    title: "Trade",
    href: "/trade",
    mode: "trader",
  },
  {
    title: "Create Fund",
    href: "/create-fund",
    mode: "trader",
  },
  {
    title: "Create Sponsor",
    href: "/create-sponsor",
    mode: "trader",
  },
];

const ModeSelector = ({
  onModeChange,
  mode,
}: {
  onModeChange: (mode: "investor" | "trader") => void;
  mode: "investor" | "trader";
}) => {
  const buttonClass =
    "rounded-full px-4 py-2 text-neutral-400 hover:brightness-[130%] w-[97px] items-center justify-center";
  return (
    <div className="items-cente w-fit-content flex justify-center rounded-full border border-[rgba(34,40,47,0.8)]">
      <div className="flex items-center p-1 pr-0">
        <button
          className={`${buttonClass} ${mode === "investor" ? `${primaryGradient} font-bold text-neutral-50` : "hover:bg-[rgba(34,40,47,0.3)]"}`}
          onClick={() => {
            onModeChange("investor");
          }}
        >
          Investor
        </button>
      </div>
      <div className="flex items-center gap-2 p-1 pl-0">
        <button
          className={`${buttonClass} ${mode === "trader" ? `${primaryGradient} font-bold text-neutral-50` : "hover:bg-[rgba(34,40,47,0.3)]"}`}
          onClick={() => {
            onModeChange("trader");
          }}
        >
          Trader
        </button>
      </div>
    </div>
  );
};

const Navbar = ({ onSelect }: { onSelect?: () => void }) => {
  const path = usePathname();
  const account = useCurrentAccount();
  const [mode, setMode] = useState<"investor" | "trader">("investor");
  const { push } = useRouter();

  useEffect(() => {
    console.log(path);
    const mode = linksMap.find((link) => link.href === path)?.mode;
    if (mode) {
      setMode(mode as "investor" | "trader");
    }
  }, [path]);
  return (
    <div
      className={`top-[80px] mr-0 flex h-[calc(100vh-80px)] min-w-[calc(264px)] flex-col items-start justify-between gap-4 ${headerGradient} py-8 lg:sticky lg:top-[96px] lg:m-4 lg:mr-0 lg:h-[calc(100vh-96px)] lg:rounded-md`}
    >
      <div className="flex w-full flex-col items-start gap-4">
        <div className="w-fit-content px-4">
          <ModeSelector
            onModeChange={(mode) => {
              setMode(mode);
              push(linksMap.find((link) => link.mode === mode)?.href ?? "/");
            }}
            mode={mode}
          />
        </div>
        {linksMap
          .filter((link) => link.mode === mode)
          .map((link) => {
            const isActive = path === link.href;
            return (
              <div
                className={`flex w-full px-4 ${isActive ? "border-l-2 border-solid border-primary-500" : ""}`}
                key={link.title}
              >
                <Link
                  className={`w-full whitespace-nowrap rounded-md px-4 py-2 text-left font-bold ${
                    isActive
                      ? "bg-neutral-50 bg-opacity-10 text-neutral-50 text-opacity-100"
                      : "text-neutral-400 text-opacity-50 hover:text-neutral-50 hover:text-opacity-100"
                  } ${link.isComingSoon ? "cursor-not-allowed hover:text-neutral-400 hover:text-opacity-50" : ""} `}
                  href={link.href}
                  onClick={(e) => {
                    if (link.isComingSoon) {
                      e.preventDefault();
                      return;
                    }
                    onSelect?.();
                  }}
                >
                  {link.title}{" "}
                  <span className="text-xs">
                    {link.isComingSoon ? "(Coming Soon)" : ""}
                  </span>
                </Link>
              </div>
            );
          })}
      </div>
      {Boolean(account) && (
        <div className="flex w-full flex-col items-start gap-2">
          <div
            className={`flex w-full px-4 ${path === "/account-settings" ? "border-l-2 border-solid border-primary-500" : ""}`}
          >
            <Link
              className={`w-full whitespace-nowrap rounded-md px-4 py-2 text-left font-bold ${
                path === "/account-settings"
                  ? "bg-neutral-50 bg-opacity-10 text-neutral-50 text-opacity-100"
                  : "text-neutral-400 text-opacity-50 hover:text-neutral-50 hover:text-opacity-100"
              } `}
              href="/account-settings"
              onClick={() => {
                onSelect?.();
              }}
            >
              Settings
            </Link>
          </div>
          <div className="px-4">
            <TraderInfo address={account?.address} />
          </div>
        </div>
      )}
      {!Boolean(account) && (
        <div className="w-full p-4 md:w-[220px]">
          <div
            className={`flex w-full flex-col items-center justify-center gap-4 rounded-xl p-4 md:w-[220px] lg:self-center ${primaryGradient}`}
          >
            <div className="text-center">Join Stingray Protocol</div>
            <div className="text-center">
              and explore the next-generation fully on-chain financial solutions
            </div>
            <ConnectButton />
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
