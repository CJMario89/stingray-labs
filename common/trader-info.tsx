import logo from "@/public/images/Stingray-Round.png";
import { formatAddress } from "@/components/connect-button";
import Image from "next/image";
import useGetUser from "@/application/query/user/use-get-user";

const TraderInfo = ({
  address,
  iconSize,
}: {
  address?: string;
  iconSize?: number;
}) => {
  const { data: user, isPending } = useGetUser({
    address,
  });
  const size = iconSize || 32;
  return (
    <div className="flex items-center gap-2">
      <div
        className={`block h-[${size}px] w-[${size}px] overflow-hidden rounded-full`}
      >
        {Boolean(user?.image) || Boolean(user?.image) ? (
          <Image
            width={size}
            height={size}
            src={user?.image || ""}
            alt={user?.name || ""}
          />
        ) : (
          <Image
            width={size}
            height={size}
            src={logo.src}
            alt={user?.name || ""}
          />
        )}
      </div>
      <div className="text-md">{`${user?.name ?? formatAddress(address)}`}</div>
      {isPending && !user && !address && <div className="skeleton h-4 w-20" />}
    </div>
  );
};

export default TraderInfo;
