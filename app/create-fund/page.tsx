"use client";
import useCreateFund from "@/application/mutation/use-create-fund";
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
    },
    {
      title: "Limit Amount",
      dataIndex: "limitAmount",
      type: "number",
      placeholder: "Enter limit amount",
    },
    {
      title: "Expected ROI",
      dataIndex: "expectedRoi",
      type: "number",
      placeholder: "Enter expected ROI",
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
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          console.log(form);
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
          />
        ))}
        <button type="submit" className="btn btn-primary self-end">
          {isPending ? <span className="loading loading-spinner"></span> : ""}
          Create Fund
        </button>
      </form>
    </div>
  );
};

export default Page;
