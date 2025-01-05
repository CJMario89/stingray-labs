import cetus from "@/public/images/partner-cetus.png";
import { CETUS_SWAP } from "@/constant/defi-data/cetus";
import { coins } from "@/constant/coin";
import useGetQuote from "@/application/query/use-get-quote";
import Image from "next/image";
import TokenInput from "./token-input";
import IconSwap from "../icons/swap";
import { useState } from "react";
import useCetusSwap from "@/application/mutation/defi/use-cetus-swap";
import useGetPoolCap from "@/application/query/pool/use-get-pool-cap";
import useGetPoolBalance from "@/application/query/pool/use-get-pool-balance";
import { primaryGradient } from "../pool-list-template";

const Swap = ({
  fundId,
  onSuccess,
}: {
  fundId?: string;
  onSuccess: () => void;
}) => {
  const tokens = [
    "USDC",
    "SUI",
    ...CETUS_SWAP.map((info) => info.name).filter((name) => name !== "USDC"),
  ];
  const [inToken, setInToken] = useState(tokens[0]);
  const [inAmount, setInAmount] = useState("");
  const [outToken, setOutToken] = useState(tokens[1]);
  const [outAmount, setOutAmount] = useState("");
  const { mutate: swap, isPending: isSwaping } = useCetusSwap({
    onSuccess: () => {
      setInAmount("");
      setOutAmount("");
      onSuccess();
    },
    fundId,
  });

  const { data: poolBalance, isLoading: isGettingBalance } = useGetPoolBalance({
    fundId,
  });

  const balance = poolBalance?.balances;

  const { data: cap, isLoading: isGettingCap } = useGetPoolCap({ fundId });

  const inTokenDecimal =
    coins.find((coin) => coin.name === inToken)?.decimal ?? 9;
  const isInSufficient =
    Number(inAmount) * Math.pow(10, inTokenDecimal) >
    Number(balance?.find((b) => b.name === inToken)?.value ?? 0) *
      Math.pow(10, inTokenDecimal);

  const [type, setType] = useState<"in" | "out">("in");

  const inAmountValid = !isNaN(Number(inAmount)) && Number(inAmount) > 0;
  const outAmountValid = !isNaN(Number(outAmount)) && Number(outAmount) > 0;

  const amountValid = type === "in" ? inAmountValid : outAmountValid;

  const { data: price, isFetching: isQuoting } = useGetQuote({
    inToken,
    outToken,
    amount: type === "in" ? Number(inAmount) : Number(outAmount),
    type,
  });

  const outLoading =
    type === "in" &&
    isQuoting &&
    !isNaN(Number(inAmount)) &&
    Number(inAmount) > 0;

  const inLoading =
    type === "out" &&
    isQuoting &&
    !isNaN(Number(outAmount)) &&
    Number(outAmount) > 0;

  const displayPrice = !isNaN(Number(price))
    ? Number(price)
        .toFixed(
          coins.find(
            (coin) => coin.name === (type === "in" ? outToken : inToken),
          )?.decimal ?? 9,
        )
        .replace(/\.?0+$/, "")
    : "";
  console.log(isGettingCap);
  console.log(isSwaping);
  console.log(isQuoting);
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 rounded-md ${primaryGradient} p-4 md:max-w-[335px]`}
    >
      <TokenInput
        isGettingBalance={isGettingBalance}
        balance={balance}
        isSwap
        isInputLoading={inLoading}
        token={inToken}
        tokens={tokens}
        amount={type === "out" ? displayPrice : inAmount}
        onSelectToken={(name: string) => {
          if (name === outToken) {
            setOutToken(inToken);
          }
          setInToken(name);
        }}
        onChangeValue={(value) => {
          setInAmount(value);
          setType("in");
        }}
      />

      <button
        className="btn btn-ghost"
        onClick={() => {
          setInToken(outToken);
          setOutToken(inToken);
          if (isNaN(Number(inAmount)) && Number(inAmount) > 0) {
            setOutAmount(inAmount);
          }

          if (isNaN(Number(outAmount)) && Number(outAmount) > 0) {
            setInAmount(outAmount);
          }
        }}
      >
        <IconSwap />
      </button>

      <TokenInput
        isGettingBalance={isGettingBalance}
        balance={balance}
        isSwap
        isInputLoading={outLoading}
        token={outToken}
        tokens={tokens}
        onSelectToken={(name: string) => {
          if (name === inToken) {
            setInToken(outToken);
          }
          setOutToken(name);
        }}
        amount={type === "in" ? displayPrice : outAmount}
        onChangeValue={(value) => {
          setOutAmount(value);
          setType("out");
        }}
      />
      <button
        className="btn btn-primary"
        disabled={
          isSwaping ||
          isInSufficient ||
          !amountValid ||
          isQuoting ||
          isGettingCap
        }
        onClick={() => {
          if (!fundId) {
            return;
          }

          swap({
            cap,
            fundId,
            inToken,
            inAmount,
            outToken,
          });
        }}
      >
        {(isSwaping || isQuoting || isGettingCap) && (
          <span className="loading loading-spinner" />
        )}
        {isInSufficient ? "INSUFFICIENT" : "SWAP"}
      </button>
      <div className="flex items-center">
        <div className="text-sm">Power By</div>
        <Image width={100} height={27} src={cetus.src} alt="Cetus" />
      </div>
    </div>
  );
};

export default Swap;
