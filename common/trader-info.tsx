import { Flex, Image, Text } from "@/styled-antd";
import { getWalrusDisplayUrl } from "./walrus-api";
import logo from "@/public/Stingray-Round.png";
import { TraderCard } from "@/type";
import { formatAddress } from "./connect-button";
import useGetTraderCard from "@/application/query/use-get-trader-card";
import { Skeleton } from "antd";

const TraderInfo = ({
  traderCard,
  address,
}: {
  traderCard?: TraderCard;
  address?: string;
}) => {
  const { data: _traderCard, isPending } = useGetTraderCard({
    address,
  });
  return (
    <Flex gap="small" align="center">
      <Flex
        style={{
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          overflow: "hidden",
        }}
        align="center"
      >
        {Boolean(traderCard?.image_blob_id) ||
        Boolean(_traderCard?.image_blob_id) ? (
          <Image
            preview={false}
            src={getWalrusDisplayUrl(
              traderCard?.image_blob_id || _traderCard?.image_blob_id
            )}
            alt={traderCard?.first_name}
          />
        ) : (
          <Image preview={false} src={logo.src} alt={traderCard?.first_name} />
        )}
      </Flex>
      {(traderCard || _traderCard || address) && (
        <Text
          style={{
            fontSize: "16px",
            fontWeight: 600,
          }}
        >{`${
          traderCard?.first_name ??
          _traderCard?.first_name ??
          formatAddress(address)
        }`}</Text>
      )}
      {isPending && !traderCard && !address && (
        <Skeleton.Input style={{ width: "100px", height: "20px" }} active />
      )}
    </Flex>
  );
};

export default TraderInfo;
