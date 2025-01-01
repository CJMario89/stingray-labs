"use client";
import useCreateSponsor from "@/application/mutation/use-create-sponsor";
import { useRouter } from "next/navigation";
import { useState } from "react";

const InputFormItem = ({
  title,
  dataIndex,
  type,
  placeholder,
  onChange,
}: {
  title: string;
  dataIndex: string;
  type: string;
  placeholder: string;
  onChange: (value: string) => void;
}) => {
  return (
    <label className="form-control w-full max-w-xs">
      <div className="label">
        <span className="label-text">{title}</span>
      </div>
      {type === "text" && (
        <input
          type="text"
          name={dataIndex}
          placeholder={placeholder}
          className="input input-sm w-full max-w-xs"
          onChange={(e) => {
            onChange(e.target.value);
          }}
        />
      )}

      {type === "textarea" && (
        <textarea
          name={dataIndex}
          placeholder={placeholder}
          className="textarea w-full max-w-xs resize-none p-2"
          onChange={(e) => {
            onChange(e.target.value);
          }}
          aria-placeholder={placeholder}
          rows={5}
        ></textarea>
      )}

      {type === "number" && (
        <input
          type="number"
          name={dataIndex}
          placeholder={placeholder}
          className="no-stepper input input-sm w-full max-w-xs"
          onChange={(e) => {
            onChange(e.target.value);
          }}
        />
      )}

      {type === "datetime-local" && (
        <input
          type="datetime-local"
          name={dataIndex}
          placeholder={placeholder}
          className="input input-sm w-full max-w-xs"
          onChange={(e) => {
            onChange(e.target.value);
          }}
        />
      )}

      {type === ""}

      {/* <div className="label">
        <span className="label-text-alt">Bottom Left label</span>
      </div> */}
    </label>
  );
};

const Page = () => {
  const items = [
    {
      title: "number of vouchers",
      dataIndex: "numberOfVouchers",
      type: "number",
      placeholder: "Enter number of vouchers",
    },
    {
      title: "amount per voucher",
      dataIndex: "amountPerVoucher",
      type: "number",
      placeholder: "Enter amount per voucher",
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
        className="flex flex-col gap-4"
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
              console.log(value);
              console.log(form);
              console.log(item.dataIndex);
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
