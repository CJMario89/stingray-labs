import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
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
  ];
  return (
    <div className="m-4 mr-0 flex min-w-[calc(200px+5vw)] flex-col items-start gap-4 rounded-md bg-base-200 py-8">
      {links.map((link) => {
        const isActive = path === link.href;
        return (
          <div
            className={`flex w-full px-4 ${isActive ? "border-primary-500 border-l-2 border-solid" : ""}`}
            key={link.title}
          >
            <Link
              className={`w-full whitespace-nowrap rounded-md px-4 py-2 text-left font-bold ${
                isActive
                  ? "bg-neutral-50 bg-opacity-10 text-neutral-50 text-opacity-100"
                  : "text-neutral-400 text-opacity-50 hover:text-neutral-50 hover:text-opacity-100"
              } `}
              href={link.href}
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
