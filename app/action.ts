"use server";
import { fetchMutation } from "convex/nextjs";
import { postSchema } from "./schemas/blog";
import z from "zod";
import { api } from "@/convex/_generated/api";
import { redirect } from "next/navigation";
import { getToken } from "@/lib/auth-server";
import { updateTag } from "next/cache";

export async function createBlogAction(values: z.infer<typeof postSchema>) {
  try {
    const parsed = postSchema.safeParse(values);

    if (!parsed.success) {
      throw new Error("something went wrong");
    }

    const token = await getToken();

    const imageUrl = await fetchMutation(
      api.post.generateImageUploadurl,
      {},
      { token },
    );

    const uploadResult = await fetch(imageUrl, {
      method: "POST",
      headers: {
        "content-Type": parsed.data.image.type,
      },
      body: parsed.data.image,
    });

    if (!uploadResult.ok) {
      return {
        error: "Failed to upload the image",
      };
    }

    const { storageId } = await uploadResult.json();

    await fetchMutation(
      api.post.createPost,
      {
        body: parsed.data.content,
        title: parsed.data.title,
        imageStorageId: storageId,
      },
      { token },
    );
  } catch {
    return {
      error: "Failed to create post",
    };
  }

  updateTag("blog");
  return redirect("/blog");
}
// a serveraction is a function that runs on the server side, the use server mark it as a server action, normally if it is not indicated once it is called in the useclient it merges with it as a client componenet but th use server makes it known it is a server action, use client means  this action runs in the browser while use srever means it runs in the server
