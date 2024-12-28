"use client";

import usePostAuth from "@/application/mutation/use-post-auth";
import usePostUserAvatar from "@/application/mutation/use-post-user-avatar";
import usePostUserInfo from "@/application/mutation/use-post-user-info";
import useGetUser from "@/application/query/user/use-get-user";
import { getCookie } from "@/common";
import { useCurrentAccount } from "@mysten/dapp-kit";
import Image from "next/image";
import { useEffect, useState } from "react";

const Page = () => {
  const { mutate: postAuth, isPending } = usePostAuth();
  const { mutate: postAvatar, isPending: isPostingAvatar } =
    usePostUserAvatar();
  const { mutate: postUserInfo, isPending: isPostingUserInfo } =
    usePostUserInfo();
  const account = useCurrentAccount();
  const [form, setForm] = useState({
    name: "",
    image: "",
  });
  const [preview, setPreview] = useState<string | ArrayBuffer | null>();
  const cookie = getCookie("signature");
  const { data: user, isSuccess } = useGetUser();
  useEffect(() => {
    if (isSuccess && user) {
      setForm((prev) => ({
        ...prev,
        name: user?.name,
      }));
    }
  }, [isSuccess, user]);
  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="text-2xl font-semibold">Account Setting</div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!account) {
            return;
          }
          // get cookies
          const cookie = getCookie("signature");
          console.log(cookie);

          if (!cookie) {
            const message = "Sign in Stingray Labs";

            postAuth({ message });
            return;
          }

          if (form.name) {
            postUserInfo({ name: form.name });
          }

          if (form.image) {
            const response = await fetch(form.image as string);
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            postAvatar({ image: buffer });
          }
        }}
      >
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Name</span>
            <input
              type="text"
              className="input input-sm w-full max-w-xs"
              onChange={(e) => {
                setForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }));
              }}
              value={form.name}
            />
          </div>
        </label>
        <label className="form-control w-full max-w-xs">
          <div className="label flex flex-col gap-2">
            <span className="label-text">Image</span>
            <input
              type="file"
              accept="image/*"
              className="input input-sm w-full max-w-xs"
              onChange={(e) => {
                const file = e.target?.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    setPreview(e.target?.result);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
          {preview && (
            <Image
              width={100}
              height={100}
              src={preview as string}
              alt="preview"
              className="mt-2 rounded-md"
            />
          )}
        </label>
        <button type="submit" className="btn btn-primary self-end">
          {(isPending || isPostingAvatar || isPostingUserInfo) && (
            <span className="loading-spin loading" />
          )}
          {cookie ? "Update" : "Sign in"}
        </button>
      </form>
    </div>
  );
};

export default Page;
