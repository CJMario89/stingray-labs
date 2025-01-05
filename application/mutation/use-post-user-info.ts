import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { stingrayClient } from "../stingray-client";

type UsePostUserInfoProps = UseMutationOptions<
  string,
  Error,
  {
    name?: string;
    image?: string;
    address: string;
  }
>;

const usePostUserInfo = (options?: UsePostUserInfoProps) => {
  return useMutation({
    mutationFn: async (data: {
      name?: string;
      image?: string;
      address: string;
    }) => {
      const response = await stingrayClient.postUserInfo(data);
      return response.json();
    },
    ...options,
  });
};

export default usePostUserInfo;
