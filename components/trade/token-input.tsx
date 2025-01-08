import { FundBalance } from "@/type";
import { coins } from "@/constant/coin";
import SelectMenu from "../select-menu";
import { secondaryGradient } from "../pool-list-template";

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
      <div className="flex flex-col gap-3 self-center">
        <div className="flex justify-between">
          <div
            className="btn btn-ghost btn-xs w-[fit-content] text-sm text-neutral-400"
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
          {!isSwap && (
            <div
              className="btn btn-ghost btn-xs w-[fit-content] text-sm text-neutral-400"
              onClick={() => {
                const tokenBalance = balance?.find((b) => b.name === token);
                if (token && tokenBalance) {
                  onChangeValue?.(tokenBalance.farmings[0]?.value?.toString());
                } else {
                  onChangeValue?.("");
                }
              }}
            >
              MAX FARM
            </div>
          )}
        </div>
        <div className="flex justify-between px-2">
          <div className="relative flex w-full items-center">
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
        </div>
        <div className="flex justify-between px-2">
          <div className="flex max-w-[150px] flex-wrap items-center text-sm text-neutral-400">
            <div className="">Balance:</div>
            <div className="text-sm text-neutral-400">
              {tokenBalance?.value}
              {isGettingBalance && <div className="skeleton mt-1 h-4 w-12" />}
              {!balance && !isGettingBalance && "--"}
            </div>
          </div>
          {!isSwap && (
            <div className="flex max-w-[150px] flex-wrap justify-end overflow-hidden text-ellipsis whitespace-nowrap text-right text-sm text-neutral-400">
              <div className="">Farming:</div>
              <div>
                {
                  tokenBalance?.farmings.find(
                    (farming) => farming.protocol === protocol,
                  )?.value
                }{" "}
                {isGettingBalance && <div className="skeleton mt-1 h-4 w-12" />}
                {(!balance ||
                  !tokenBalance?.farmings.find(
                    (farming) => farming.protocol === protocol,
                  )?.value) &&
                  !isGettingBalance &&
                  "--"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenInput;
