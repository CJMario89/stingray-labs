import Link from "next/link";

const Navbar = () => {
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
    <div className="m-4 flex min-w-[20%] flex-col items-start gap-4 rounded-md bg-base-100 px-2 py-4">
      {links.map((link) => (
        <Link
          className="btn btn-ghost w-full whitespace-nowrap text-left"
          key={link.title}
          href={link.href}
        >
          {link.title}
        </Link>
      ))}
    </div>
  );
};

export default Navbar;
