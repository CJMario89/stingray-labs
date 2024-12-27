import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { stingrayClient } from "../stingray-client";
import { useCurrentAccount, useSignPersonalMessage } from "@mysten/dapp-kit";

type UsePostAuthProps = UseMutationOptions<void, Error, { message: string }>;

const usePostAuth = (options?: UsePostAuthProps) => {
  const account = useCurrentAccount();
  const { mutateAsync: signMessage } = useSignPersonalMessage({
    onSuccess: (signature) => {
      console.log(signature);
    },
  });

  return useMutation({
    mutationFn: async () => {
      const message =
        (process.env.NEXT_PUBLIC_SIGN_MESSAGE || "Sign in Stingray Labs") +
        "-" +
        new Date().toISOString();
      if (!account) {
        throw new Error("Account not found");
      }
      const data = await signMessage({
        account,
        message: Buffer.from(message, "utf-8"),
      });

      const response = await stingrayClient.postAuth({
        message,
        signature: data.signature,
      });
      return response.json();
    },
    ...options,
  });
};

export default usePostAuth;
