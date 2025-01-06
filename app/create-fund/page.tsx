"use client";
import useCreateFund from "@/application/mutation/use-create-fund";
import InputFormItem from "@/components/common/input-form-item";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

const Page = () => {
  const items = [
    {
      title: "Name",
      dataIndex: "name",
      type: "text",
      placeholder: "Enter name",
    },
    {
      title: "Description",
      dataIndex: "description",
      type: "textarea",
      placeholder: "Enter description",
    },
    {
      title: "Trader Fee",
      dataIndex: "traderFee",
      type: "number",
      placeholder: "Enter trader fee",
      unit: "%",
    },
    {
      title: "Funding Start Time",
      dataIndex: "fundingStartTime",
      type: "datetime-local",
      placeholder: "Enter funding start time",
    },
    {
      title: "Funding End Time",
      dataIndex: "fundingEndTime",
      type: "datetime-local",
      placeholder: "Enter funding end time",
    },
    {
      title: "Trading End Time",
      dataIndex: "tradingEndTime",
      type: "datetime-local",
      placeholder: "Enter trading end time",
    },
    {
      title: "Initial Amount",
      dataIndex: "initialAmount",
      type: "number",
      placeholder: "Enter initial amount",
      unit: "USDC",
    },
    {
      title: "Limit Amount",
      dataIndex: "limitAmount",
      type: "number",
      placeholder: "Enter limit amount",
      unit: "USDC",
    },
    {
      title: "Expected ROI",
      dataIndex: "expectedRoi",
      type: "number",
      placeholder: "Enter expected ROI",
      unit: "%",
    },
  ];
  const [form, setForm] = useState({
    name: "",
    description: "",
    traderFee: 0,
    initialAmount: 0,
    fundingStartTime: Date.now(),
    fundingEndTime: Date.now(),
    tradingEndTime: 0,
    limitAmount: 0,
    expectedRoi: 0,
  });
  const { push } = useRouter();
  const account = useCurrentAccount();
  const { mutate: createFund, isPending } = useCreateFund({
    onError: (error) => {
      console.error(error);
    },
    onSuccess: () => {
      push("/stingray-pools");
    },
  });
  return (
    <div className="flex h-full w-full flex-col gap-4">
      <form
        noValidate
        className="flex w-[320px] flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          console.log(form);
          if (!account) {
            toast.error("Please connect your wallet");
            return;
          }
          createFund(form);
        }}
      >
        {items.map((item) => (
          <InputFormItem
            key={item.dataIndex}
            title={item.title}
            dataIndex={item.dataIndex}
            type={item.type}
            placeholder={item.placeholder}
            onChange={(value) => {
              setForm({
                ...form,
                [item.dataIndex]: value,
              });
            }}
            unit={item.unit}
          />
        ))}
        <button
          disabled={isPending || !account}
          type="submit"
          className="btn btn-primary self-end"
        >
          {isPending ? <span className="loading loading-spinner"></span> : ""}
          Create Fund
        </button>
      </form>
    </div>
  );
};

export default Page;
