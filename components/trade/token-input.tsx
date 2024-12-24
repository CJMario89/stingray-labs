import { FundBalance } from "@/type";
import { coins } from "@/constant/coin";
import SelectMenu from "../select-menu";
import { secondaryGradient } from "@/app/stingray-pools/page";

const TokenInput = ({
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
      <div className={`"items-center" flex w-full justify-between`}>
        <div className="flex flex-col gap-2">
          <div
            className="cursor-pointer text-sm text-neutral-400"
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

          <div className="text-sm text-neutral-400">
            Balance: {tokenBalance?.value}
          </div>
        </div>
        <div className="relative flex shrink-0 self-center">
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
            <div className="absolute bottom-[-16px] right-1 whitespace-nowrap text-right text-sm text-neutral-400">
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
