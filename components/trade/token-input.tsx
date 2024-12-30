import { FundBalance } from "@/type";
import { coins } from "@/constant/coin";
import SelectMenu from "../select-menu";
import { secondaryGradient } from "@/app/stingray-pools/page";

const TokenInput = ({
  isGettingBalance,
  protocol,
  balance,
  isInputLoading,
  isSwap,
  tokens,
  token,
  amount,
  onSelectToken,
  onChangeValue,
}: {
  isGettingBalance?: boolean;
  protocol?: string;
  balance?: FundBalance;
  isInputLoading?: boolean;
  isSwap?: boolean;
  isSwapOut?: boolean;
  tokens: string[];
  token: string;
  amount: string;
  onSelectToken: (name: string) => void;
  onChangeValue?: (value: string) => void;
}) => {
  const tokenBalance = balance?.find((b) => b.name === token);
  return (
    <div className={`flex flex-col gap-4 rounded-xl ${secondaryGradient} p-4`}>
      <div className={`flex h-[100px] w-full items-center justify-between`}>
        <div className="relative flex flex-col self-center">
          <div
            className="btn btn-ghost btn-xs absolute left-[0px] top-[-39px] w-[fit-content] text-sm text-neutral-400"
            onClick={() => {
              const tokenBalance = balance?.find((b) => b.name === token);
              if (token && tokenBalance) {
                onChangeValue?.(tokenBalance.value.toString());
              } else {
                onChangeValue?.("");
              }
            }}
          >
            MAX
          </div>
          <div className="relative w-full">
            <div
              className={`absolute left-[10px] top-[3px] w-full ${
                isInputLoading ? "block" : "hidden"
              } transition-all duration-200`}
            />
            <input
              value={amount}
              className="w-full bg-transparent text-2xl font-bold text-white placeholder-neutral-400 focus:border-transparent focus:placeholder-transparent focus:outline-none focus:ring-0"
              onChange={(e) => {
                onChangeValue?.(e.target.value);
              }}
              placeholder="0"
            />
          </div>
          <div className="absolute bottom-[-39px] left-1 text-sm text-neutral-400">
            Balance: {tokenBalance?.value}
            {isGettingBalance && <span className="skeleton" />}
          </div>
        </div>
        <div className="relative flex shrink-0 flex-col self-center">
          {!isSwap && (
            <div
              className="btn btn-ghost btn-xs absolute right-[0px] top-[-30px] w-[fit-content] text-sm text-neutral-400"
              onClick={() => {
                const tokenBalance = balance?.find((b) => b.name === token);
                if (token && tokenBalance) {
                  onChangeValue?.(tokenBalance.farmings[0].value.toString());
                } else {
                  onChangeValue?.("");
                }
              }}
            >
              MAX FARM
            </div>
          )}
          <SelectMenu
            options={tokens.map((token) => {
              return {
                key: token,
                value: token,
                icon: coins?.find((coin) => coin.name === token)?.iconUrl ?? "",
              };
            })}
            value={{
              key: token,
              value: token,
              icon: coins?.find((coin) => coin.name === token)?.iconUrl ?? "",
            }}
            onSelect={(option) => {
              onSelectToken?.(option.value);
              // onChangeValue?.("");
            }}
          />
          {!isSwap && (
            <div className="absolute bottom-[-30px] right-1 whitespace-nowrap text-right text-sm text-neutral-400">
              Farming:{" "}
              {tokenBalance?.farmings.find(
                (farming) => farming.protocol === protocol,
              )?.value ?? 0}{" "}
              {tokenBalance?.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenInput;
