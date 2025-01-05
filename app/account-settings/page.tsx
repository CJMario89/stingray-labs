"use client";

import usePostAuth from "@/application/mutation/use-post-auth";
import usePostUserInfo from "@/application/mutation/use-post-user-info";
import useGetUser from "@/application/query/user/use-get-user";
import { getCookie } from "@/common";
import { useCurrentAccount } from "@mysten/dapp-kit";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const Page = () => {
  const { mutate: postAuth, isPending } = usePostAuth({
    onSuccess: () => {
      toast.success("Sign in successfully");
    },
  });

  const { mutate: postUserInfo, isPending: isPostingUserInfo } =
    usePostUserInfo({
      onSuccess: () => {
        toast.success("Update user info successfully");
      },
    });
  const account = useCurrentAccount();
  const [form, setForm] = useState<{
    name: string;
    image: string | ArrayBuffer | null | undefined;
  }>({
    name: "",
    image: null,
  });
  const cookie = getCookie(`signature-${account?.address}`);
  const hasSignIn = !!cookie;

  const { data: user, isSuccess } = useGetUser();

  useEffect(() => {
    if (isSuccess && user) {
      setForm((prev) => ({
        ...prev,
        name: user?.name,
        image: user?.image,
      }));
    }
  }, [isSuccess, user]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!account) {
      return;
    }

    if (!form.name && !form.image) {
      return;
    }

    postUserInfo({
      address: account?.address,
      name: form.name,
      ...(form.image && { image: form.image as string }),
    });
  };

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div className="text-2xl font-semibold">Account Setting</div>
      {hasSignIn && (
        <form
          className="flex w-[320px] flex-col gap-4"
          onSubmit={async (e) => {
            onSubmit(e);
          }}
        >
          <label className="form-control w-full max-w-xs gap-2">
            <span className="label-text">Name</span>
            <input
              disabled={!hasSignIn}
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
          </label>
          <label className="form-control w-full max-w-xs gap-2">
            <span className="label-text">Image</span>
            <input
              disabled={!hasSignIn}
              type="file"
              accept="image/*"
              className="input input-md w-full max-w-xs"
              onChange={(e) => {
                const file = e.target?.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const result = e.target?.result as string;
                    console.log(result);
                    setForm((prev) => ({
                      ...prev,
                      image: result,
                    }));
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            {form?.image && (
              <Image
                width={320}
                height={320}
                src={form?.image as string}
                alt="preview"
                className="mt-2 rounded-md"
              />
            )}
          </label>
          <button type="submit" className="btn btn-primary self-end">
            {isPostingUserInfo && <span className="loading-spin loading" />}
            Save
          </button>
        </form>
      )}
      {!hasSignIn && (
        <button
          className="btn btn-primary max-w-[320px]"
          onClick={() => {
            const message = "Sign in Stingray Labs";
            postAuth({ message });
          }}
        >
          {isPending && <span className="loading-spin loading" />}
          Sign in
        </button>
      )}
    </div>
  );
};

export default Page;
