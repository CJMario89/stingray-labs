import { fetchWithRetry } from ".";

export const aggregators = [
  "https://aggregator.walrus-testnet.walrus.space",
  "https://wal-aggregator-testnet.staketab.org",
  "https://walrus-testnet-aggregator.bartestnet.com",
  "https://walrus-testnet.blockscope.net",
  "https://walrus-testnet-aggregator.nodes.guru",
  "https://walrus-cache-testnet.overclock.run",
  "https://sui-walrus-testnet.bwarelabs.com/aggregator",
  "https://walrus-testnet-aggregator.stakin-nodes.com",
  "https://testnet-aggregator-walrus.kiliglab.io",
  "https://walrus-cache-testnet.latitude-sui.com",
  "https://walrus-testnet-aggregator.nodeinfra.com",
  "https://walrus-tn.juicystake.io:9443",
  "https://walrus-agg-testnet.chainode.tech:9002",
  "https://walrus-testnet-aggregator.starduststaking.com:11444",
];

export const publishs = [
  "https://wal-publisher-testnet.staketab.org",
  "https://walrus-testnet-publisher.bartestnet.com",
  "https://walrus-testnet-publisher.nodes.guru",
  "https://sui-walrus-testnet.bwarelabs.com/publisher",
  "https://publisher.walrus-testnet.walrus.space",
  "https://walrus-testnet-publisher.stakin-nodes.com",
  "https://testnet-publisher-walrus.kiliglab.io",
  "https://walrus-testnet-publisher.nodeinfra.com",
  "https://walrus-testnet.blockscope.net:11444",
  "https://walrus-publish-testnet.chainode.tech:9003",
  "https://walrus-testnet-publisher.starduststaking.com:11445",
];

export const postWalrus = async ({
  content,
  type,
  query,
}: {
  content: Buffer | string | FormData;
  type: string;
  query?: string;
}) => {
  const urls = publishs.map(
    (url) => `${url}/v1/store${query ? `?${query}` : ""}`
  );
  const response = await fetchWithRetry(
    urls[0],
    {
      method: "PUT",
      headers: {
        "Content-Type": type,
      },
      body: content,
    },
    10,
    20000,
    urls
  );
  console.log(response);
  if (!response) {
    throw new Error("Failed to post to walrus");
  }
  const data = await response.json();
  return data;
};

export const getWalrus = async ({ id }: { id: string }) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR}/${id}`,
    {
      method: "GET",
      headers: {
        "Access-Control-Allow-Origin": "*",
        Accept: "*/*",
      },
    }
  );
  return response;
};

export async function postWalrusApi(blob: Blob) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/post-walrus`,
    {
      method: "POST",
      body: blob,
    }
  );
  const data = await response.json();
  console.log(data);
  return (
    data?.newlyCreated?.blobObject?.blobId ?? data?.alreadyCertified?.blobId
  );
}

export function getWalrusDisplayUrl(blobId?: string) {
  return `${process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR}/${blobId}`;
}
