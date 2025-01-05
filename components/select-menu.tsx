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
  dropdownEnd = true,
}: {
  value?: Option;
  options: Option[];
  onSelect: (option: Option) => void;
  dropdownEnd?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`dropdown ${dropdownEnd ? "dropdown-end" : "dropdown-start"} w-[fit-content] shrink-0`}
    >
      <div
        tabIndex={0}
        role="button"
        className="btn"
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
        {value.key}
        <IconChevronDown />
      </div>
      <ul
        tabIndex={0}
        className={`menu ${
          open ? "" : "hidden"
        } dropdown-content z-[10] max-h-[200px] w-[max-content] overflow-y-auto rounded-md bg-base-100 p-2 shadow`}
      >
        <div className="flex w-full flex-col">
          {options.map((option) => (
            <li key={option.value} className="w-full">
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
                  <div className="whitespace-nowrap">{option.key}</div>
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
