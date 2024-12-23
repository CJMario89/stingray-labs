import Image from "next/image";
import React, { useState } from "react";
import IconChevronDown from "./icons/chevron-down";

type Option = {
  key: string;
  value: string;
  icon?: string;
};

const SelectMenu = ({
  options,
  onSelect,
  value = options[0],
}: {
  value?: Option;
  options: Option[];
  onSelect: (option: Option) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="dropdown">
      <div
        tabIndex={0}
        role="button"
        className="btn m-1"
        onClick={() => {
          setOpen(!open);
        }}
      >
        {Boolean(value.icon) && (
          <Image
            alt="icon"
            src={value.icon ?? ""}
            width={24}
            height={24}
            className="h-6 w-6 overflow-hidden rounded-full"
          />
        )}
        {value.value}
        <IconChevronDown />
      </div>
      <ul
        tabIndex={0}
        className={`menu ${
          open ? "" : "hidden"
        } dropdown-content z-[1] max-h-[200px] overflow-y-auto rounded-md bg-base-100 p-2 shadow`}
      >
        <div className="flex w-full flex-col">
          {options.map((option) => (
            <li key={option.key} className="w-full">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  onSelect?.(option);
                  setOpen(false);
                }}
              >
                <div className="flex w-full items-center justify-start gap-2">
                  {Boolean(value.icon) && (
                    <Image
                      alt="icon"
                      src={option.icon ?? ""}
                      width={24}
                      height={24}
                      className="h-6 w-6 overflow-hidden rounded-full"
                    />
                  )}
                  <div>{option.value}</div>
                </div>
              </button>
            </li>
          ))}
        </div>
      </ul>
    </div>
  );
};

export default SelectMenu;
