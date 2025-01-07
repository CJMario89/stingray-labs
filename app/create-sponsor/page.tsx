"use client";
import useCreateSponsor from "@/application/mutation/use-create-sponsor";
import InputFormItem from "@/components/common/input-form-item";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

const Page = () => {
  const items = [
    {
      title: "Number of Vouchers",
      dataIndex: "numberOfVouchers",
      type: "number",
      placeholder: "Enter number of vouchers",
    },
    {
      title: "Amount per Voucher",
      dataIndex: "amountPerVoucher",
      type: "number",
      placeholder: "Enter amount per voucher",
      unit: "USDC",
    },
    {
      title: "Total Pool Amount",
      dataIndex: "totalPoolAmount",
      type: "number",
      placeholder: "Enter total pool amount",
      unit: "USDC",
    },
    {
      title: "Expire Time",
      dataIndex: "expireTime",
      type: "datetime-local",
      placeholder: "Enter expire time",
    },
  ];
  const [form, setForm] = useState({
    numberOfVouchers: "",
    amountPerVoucher: "",
    totalPoolAmount: "",
    expireTime: "",
  });
  const { push } = useRouter();
  const account = useCurrentAccount();
  const { mutate: createSponsor, isPending } = useCreateSponsor({
    onError: (error) => {
      console.error(error);
    },
    onSuccess: () => {
      push("/sponsor-pools");
    },
  });
  return (
    <div className="flex h-full w-full flex-col items-center gap-4">
      <div className="w-[320px] text-2xl font-semibold">
        Create Sponsor Pool
      </div>
      <form
        noValidate
        className="flex w-[320px] flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!account) {
            toast.error("Please connect your wallet");
            return;
          }
          createSponsor(form);
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
          Create Sponsor Pool
        </button>
      </form>
    </div>
  );
};

export default Page;
