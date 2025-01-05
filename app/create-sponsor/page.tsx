"use client";
import useCreateSponsor from "@/application/mutation/use-create-sponsor";
import InputFormItem from "@/components/common/input-form-item";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    },
    {
      title: "Total Pool Amount",
      dataIndex: "totalPoolAmount",
      type: "number",
      placeholder: "Enter total pool amount",
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
  const { mutate: createSponsor, isPending } = useCreateSponsor({
    onError: (error) => {
      console.error(error);
    },
    onSuccess: () => {
      push("/sponsor-pools");
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
          />
        ))}
        <button type="submit" className="btn btn-primary self-end">
          {isPending ? <span className="loading loading-spinner"></span> : ""}
          Create Sponsor Pool
        </button>
      </form>
    </div>
  );
};

export default Page;
