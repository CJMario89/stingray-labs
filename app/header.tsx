"use client";

import Image from "next/image";
import Logo from "@/public/images/Stingray-White.png";
import IconMenu from "@/components/icons/menu";
import ConnectButton from "@/components/connect-button";
import IconClose from "@/components/icons/close";

export const headerGradient = "bg-gradient-to-br from-black-200 to-base-200";

const Header = ({
  menuOpen,
  onMenuToggle,
}: {
  menuOpen: boolean;
  onMenuToggle: () => void;
}) => {
  return (
    <div className={`navbar fixed z-[10000] ${headerGradient} px-4`}>
      <div className="flex flex-1">
        <Image
          src={Logo}
          alt="logo"
          width={40}
          height={40}
          className="h-16 w-16"
        />
        <div className="ml-2 flex flex-col justify-center">
          <div className="font-primary text-lg font-bold">Stingray</div>
          <div className="font-primary text-lg font-bold">Labs</div>
        </div>
      </div>
      <div className="hidden flex-none lg:flex">
        <ConnectButton />
      </div>
      <div className="flex-none lg:hidden">
        <button
          className="btn btn-square btn-ghost"
          onClick={() => {
            onMenuToggle();
          }}
        >
          {menuOpen ? <IconClose /> : <IconMenu />}
        </button>
      </div>
    </div>
  );
};

export default Header;
