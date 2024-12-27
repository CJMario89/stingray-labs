import { useMutation } from "@tanstack/react-query";
import { stingrayClient } from "../stingray-client";

const usePostUserAvatar = () => {
  return useMutation({
    mutationFn: async (data: { image: Buffer }) => {
      const response = await stingrayClient.postUserAvatar(data);
      return response.json();
    },
  });
};

export default usePostUserAvatar;
