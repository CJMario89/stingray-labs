"use client";

import IconSearch from "@/components/icons/search";

const Page = () => {
  return (
    <div className="flex h-full w-full flex-col">
      <label className="input flex items-center gap-2">
        <input type="text" className="grow" placeholder="Search" />
        <IconSearch />
      </label>
    </div>
  );
};

export default Page;
