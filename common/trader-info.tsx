import { getWalrusDisplayUrl } from "./walrus-api";
import logo from "@/public/images/Stingray-Round.png";
import { TraderCard } from "@/type";
import useGetTraderCard from "@/application/query/trader/use-get-trader-card";
import { formatAddress } from "@/components/connect-button";
import Image from "next/image";

const TraderInfo = ({
  traderCard,
  address,
}: {
  traderCard?: TraderCard;
  address?: string;
}) => {
  const { data: _traderCard, isPending } = useGetTraderCard({
    owner: address,
    enabled: Boolean(address),
  });
  return (
    <div className="flex items-center gap-2">
      <div className="block h-8 w-8 overflow-hidden rounded-full">
        {Boolean(traderCard?.image_blob_id) ||
        Boolean(_traderCard?.image_blob_id) ? (
          <Image
            width={32}
            height={32}
            src={getWalrusDisplayUrl(
              traderCard?.image_blob_id || _traderCard?.image_blob_id,
            )}
            alt={traderCard?.first_name || ""}
          />
        ) : (
          <Image
            width={32}
            height={32}
            src={logo.src}
            alt={traderCard?.first_name || ""}
          />
        )}
      </div>
      {(traderCard || _traderCard || address) && (
        <div className="text-md">
          {`${
            traderCard?.first_name ??
            _traderCard?.first_name ??
            formatAddress(address)
          }`}
        </div>
      )}
      {isPending && !traderCard && !address && (
        <div className="skeleton h-4 w-20" />
      )}
    </div>
  );
};

export default TraderInfo;
