import TokenInput from "./token-input";

import Image from "next/image";
import { BUCKET_DEPOSIT } from "@/constant/defi-data/bucket";
import { SCALLOP_DEPOSIT } from "@/constant/defi-data/scallop";
import bucket from "@/public/images/partner-bucket.png";
import scallop from "@/public/images/partner-scallop.png";
import { useState } from "react";
import SelectMenu from "../select-menu";
import useScallopDeposit from "@/application/mutation/defi/use-scallop-deposit";
import useBucketDeposit from "@/application/mutation/defi/use-bucket-deposit";
import useScallopWithdraw from "@/application/mutation/defi/use-scallop-withdraw";
import useBucketWithdraw from "@/application/mutation/defi/use-bucket-withdraw";
import useGetPoolBalance from "@/application/query/pool/use-get-pool-balance";
import { coins } from "@/constant/coin";
import { primaryGradient } from "../pool-list-template";

const Farm = ({ fundId }: { fundId?: string }) => {
  const farms = [
    {
      name: "Bucket",
      powerBy: bucket,
      tokens: BUCKET_DEPOSIT.map((info) => info.name),
    },
    {
      name: "Scallop",
      powerBy: scallop,
      tokens: SCALLOP_DEPOSIT.map((info) => info.name),
    },
    // {
    //   name: "Suilend",
    //   powerBy: suilend,
    //   tokens: SUILEND_DEPOSIT.map((info) => info.name),
    // },
  ];
  const [activeFarm, setActiveFarm] = useState(farms[0]);
  const { name, powerBy, tokens } = activeFarm;

  const { data: poolBalance, isLoading: isGettingBalance } = useGetPoolBalance({
    fundId,
  });
  console.log(poolBalance);
  const [token, setToken] = useState<string>(tokens?.[0]);
  const [amount, setAmount] = useState<string>("");

  const { mutate: scallopDeposit, isPending: isScallopDepositing } =
    useScallopDeposit({
      fundId,
      onSuccess: () => {
        setAmount("");
      },
    });
  const { mutate: bucketDeposit, isPending: isBucketDepositing } =
    useBucketDeposit({
      fundId,
      onSuccess: () => {
        setAmount("");
      },
    });
  // const { mutate: suilendDeposit, isPending: isSuilendDepositing } =
  //   useSuilendDeposit({
  //     fundId,
  //     onSuccess: () => {
  //       setAmount("");
  //     },
  //   });
  const { mutate: scallopWithdraw, isPending: isScallopWithdrawing } =
    useScallopWithdraw({
      fundId,
      onSuccess: () => {
        setAmount("");
      },
    });
  const { mutate: bucketWithdraw, isPending: isBucketWithdrawing } =
    useBucketWithdraw({
      fundId,
      onSuccess: () => {
        setAmount("");
      },
    });
  // const { mutate: suilendWithdraw, isPending: isSuilendWithdrawing } =
  //   useSuilendWithdraw({
  //     fundId,
  //     onSuccess: () => {
  //       setAmount("");
  //     },
  //   });

  const isDepositing = isScallopDepositing || isBucketDepositing;
  // || isSuilendDepositing;

  const isWithdrawing = isScallopWithdrawing || isBucketWithdrawing;
  // || isSuilendWithdrawing;

  const balance = poolBalance?.balances;

  const farmingBalance = balance
    ?.find((b) => b.name === token)
    ?.farmings?.find((f) => f.protocol === name)?.value;

  const reStakeAmount =
    Number(farmingBalance) *
      Math.pow(10, coins.find((c) => c.name === token)?.decimal ?? 9) -
    Number(amount) *
      Math.pow(10, coins.find((c) => c.name === token)?.decimal ?? 9);

  const isWithdrawInSuffient = reStakeAmount < 0 || isNaN(reStakeAmount);
  const isDepositInsuffient =
    Number(amount) > Number(balance?.find((b) => b.name === token)?.value);
  const isAmountInvalid = isNaN(Number(amount)) || Number(amount) === 0;

  return (
    <div
      className={`flex w-[335px] flex-col items-center justify-between gap-4 ${primaryGradient} rounded-md p-4`}
    >
      <div className="flex flex-col gap-4">
        <SelectMenu
          options={farms.map((farm) => ({
            key: farm.name,
            value: farm.name,
            icon: farm.powerBy.src,
          }))}
          value={{
            key: activeFarm.name,
            value: activeFarm.name,
          }}
          onSelect={(value) => {
            const farm = farms.find((farm) => farm.name === value.key);
            if (!farm) {
              return;
            }
            setActiveFarm(farm);
            setToken(farm.tokens[0]);
          }}
        />
        <div className={`flex w-full flex-col items-center gap-4`}>
          <TokenInput
            isGettingBalance={isGettingBalance}
            protocol={name}
            balance={balance}
            amount={amount}
            token={token}
            tokens={tokens}
            onSelectToken={(value) => {
              setToken(value);
            }}
            onChangeValue={(value) => {
              setAmount(value);
            }}
          />

          <div className="mt-5 flex w-full flex-row justify-center gap-4">
            <button
              className="btn btn-primary self-center"
              onClick={() => {
                if (!fundId) {
                  return;
                }
                if (name === "Scallop") {
                  scallopDeposit({
                    amount,
                    name: token,
                    fundId,
                  });
                } else if (name === "Bucket") {
                  const hasDeposit =
                    (balance?.find((b) => b.name === token)?.farmings?.length ??
                      0) > 0;

                  const buckAmount = balance
                    ?.find((b) => b.name === token)
                    ?.farmings.reduce((acc, cur) => {
                      return acc + Number(cur.value);
                    }, 0);

                  bucketDeposit({
                    amount,
                    name: token,
                    fundId,
                    hasDeposit,
                    originalAmount: buckAmount,
                  });
                }
                // else if (name === "Suilend") {
                //   suilendDeposit({
                //     amount,
                //     name: token,
                //     fundId,
                //   });
                // }
              }}
              disabled={
                isDepositing ||
                isWithdrawing ||
                isAmountInvalid ||
                isDepositInsuffient
              }
            >
              {isDepositing ? (
                <span className="loading loading-spinner"></span>
              ) : (
                ""
              )}
              Deposit
            </button>
            <button
              className="btn btn-primary self-center"
              onClick={() => {
                if (!fundId) {
                  return;
                }
                const farmings = balance?.find(
                  (b) => b.name === token,
                )?.farmings;
                if (name === "Scallop") {
                  const liquidityAmount = farmings
                    ?.find((f) => f.protocol === "Scallop")
                    ?.liquidityValue.toString();
                  if (!liquidityAmount) {
                    return;
                  }

                  scallopWithdraw({
                    // liquidityAmount: Number(liquidityAmount) - 1,
                    liquidityAmount: Number(liquidityAmount),
                    reStakeAmount,
                    name: token,
                    fundId,
                  });
                } else if (name === "Bucket") {
                  const liquidityAmount = farmings
                    ?.find((f) => f.protocol === "Bucket")
                    ?.liquidityValue.toString();

                  if (!liquidityAmount) {
                    return;
                  }

                  bucketWithdraw({
                    name: token,
                    fundId,
                    reStakeAmount,
                  });
                }
                // else if (name === "Suilend") {
                //   const liquidityAmount = farmings
                //     ?.find((f) => f.protocol === "Suilend")
                //     ?.liquidityValue.toString();
                //   if (!liquidityAmount) {
                //     return;
                //   }
                //   suilendWithdraw({
                //     // liquidityAmount: Number(liquidityAmount) - 1,
                //     liquidityAmount: Number(liquidityAmount),
                //     reStakeAmount,
                //     name: token,
                //     fundId,
                //   });
                // }
              }}
              disabled={
                isWithdrawing ||
                isDepositing ||
                isAmountInvalid ||
                isWithdrawInSuffient
              }
            >
              {isWithdrawing ? (
                <span className="loading loading-spinner"></span>
              ) : (
                ""
              )}
              Withdraw
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-row items-center">
        <div className="text-sm">Power By</div>
        <Image
          width={name === "Bucket" ? 90 : 100}
          height={name === "Bucket" ? 30 : 33}
          src={powerBy}
          alt={name}
        />
      </div>
    </div>
  );
};

export default Farm;
