"use client";

import Image from "next/image";
import Logo from "@/public/images/Stingray-White.png";
import IconMenu from "@/components/icons/menu";
import ConnectButton from "@/components/connect-button";

const Header = ({ onMenuOpen }: { onMenuOpen: () => void }) => {
  return (
    <div className="navbar bg-base-200">
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
      <div className="flex-none">
        <ConnectButton />
      </div>
      <div className="flex-none md:hidden">
        <button
          className="btn btn-square btn-ghost"
          onClick={() => {
            onMenuOpen();
          }}
        >
          <IconMenu />
        </button>
      </div>
    </div>
  );
};

export default Header;
