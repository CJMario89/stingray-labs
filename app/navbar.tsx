import Link from "next/link";
import { usePathname } from "next/navigation";
import { headerGradient } from "./header";

const Navbar = ({ onSelect }: { onSelect?: () => void }) => {
  const path = usePathname();
  const links = [
    {
      title: "Stingray Pools",
      href: "/stingray-pools",
    },
    {
      title: "Stingray Arena",
      href: "/stingray-arena",
    },
    {
      title: "Protocol Status",
      href: "/protocol-status",
    },
    {
      title: "Sting Points",
      href: "/sting-points",
    },
    {
      title: "My Profolio",
      href: "/my-profolio",
    },
    {
      title: "Trade",
      href: "/trade",
    },
  ];
  return (
    <div
      className={`top-[80px] mr-0 flex h-[calc(100vh-80px)] min-w-[calc(200px+5vw)] flex-col items-start gap-4 ${headerGradient} py-8 lg:sticky lg:top-[96px] lg:m-4 lg:mr-0 lg:h-[calc(100vh-96px)] lg:rounded-md`}
    >
      {links.map((link) => {
        const isActive = path === link.href;
        return (
          <div
            className={`flex w-full px-4 ${isActive ? "border-l-2 border-solid border-primary-500" : ""}`}
            key={link.title}
          >
            <Link
              className={`w-full whitespace-nowrap rounded-md px-4 py-2 text-left font-bold ${
                isActive
                  ? "bg-neutral-50 bg-opacity-10 text-neutral-50 text-opacity-100"
                  : "text-neutral-400 text-opacity-50 hover:text-neutral-50 hover:text-opacity-100"
              } `}
              href={link.href}
              onClick={() => {
                onSelect?.();
              }}
            >
              {link.title}
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default Navbar;
