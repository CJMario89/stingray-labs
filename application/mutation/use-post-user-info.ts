import { useMutation } from "@tanstack/react-query";
import { stingrayClient } from "../stingray-client";

const usePostUserInfo = () => {
  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const response = await stingrayClient.postUserInfo(data);
      return response.json();
    },
  });
};

export default usePostUserInfo;
