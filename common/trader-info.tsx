import logo from "@/public/images/Stingray-Round.png";
import { formatAddress } from "@/components/connect-button";
import Image from "next/image";
import useGetUser from "@/application/query/user/use-get-user";

const TraderInfo = ({ address }: { address?: string }) => {
  const { data: user, isPending } = useGetUser();
  return (
    <div className="flex items-center gap-2">
      <div className="block h-8 w-8 overflow-hidden rounded-full">
        {Boolean(user?.image) || Boolean(user?.image) ? (
          <Image
            width={32}
            height={32}
            src={user?.image || ""}
            alt={user?.name || ""}
          />
        ) : (
          <Image width={32} height={32} src={logo.src} alt={user?.name || ""} />
        )}
      </div>
      <div className="text-md">{`${user?.name ?? formatAddress(address)}`}</div>
      {isPending && !user && !address && <div className="skeleton h-4 w-20" />}
    </div>
  );
};

export default TraderInfo;
