import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Separator } from "@/components/ui/separator";
import { CommentSection } from "@/components/web/CommentSection";
import { preloadQuery } from "convex/nextjs";
import { Metadata } from "next";
import PostPresence from "@/components/web/PostPresence";
import { getToken } from "@/lib/auth-server";
import { redirect } from "next/navigation";

interface PostIdRouteProps {
  params: Promise<{
    postId: Id<"posts">;
  }>;
}

export async function generateMetadata({
  params,
}: PostIdRouteProps): Promise<Metadata> {
  const { postId } = await params;

  const post = await fetchQuery(api.post.getPostById, { postId: postId });

  if (!post) {
    return {
      title: "Post not found",
    };
  }

  return {
    title: post.title,
    description: post.body,
  };
}

export default async function PostIdRoute({ params }: PostIdRouteProps) {
  const { postId } = await params;

  const token = await getToken();

  const [post, preloadedComments, userId] = await Promise.all([
    await fetchQuery(api.post.getPostById, { postId: postId }),
    await preloadQuery(api.comment.getCommentsByPostId, {
      postId: postId,
    }),

    await fetchQuery(api.presence.getUserId, {}, { token }),
  ]); // to make the 2 queries to run parallel instaed of sequentially, it boosts performance

  if (!userId) {
    return redirect("/auth/login");
  }

  if (!post) {
    return (
      <div>
        <h1 className="text-6xl font-extrabold text-red-500 py-20">
          No post found
        </h1>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 animate-in fade-in duration-500 relative">
      <Link
        className={buttonVariants({ variant: "outline", className: "mb-4" })}
        href="/blog"
      >
        <ArrowLeft className="size-4" />
        Back to blog
      </Link>

      <div className="relative w-full h-100 mb-8 rounded-xl overflow-hidden shadow-sm">
        <Image
          src={
            post.imageUrl ??
            `https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1631&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`
          }
          alt={post.title}
          fill
          className="object-cover hover:scale-105 transition-transform duration-500"
        />{" "}
        {/*always use relative wheneveer you want to render an image*/}
      </div>

      <div className="space-y-4 flex flex-col">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          {post.title}
        </h1>

        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground ">
            Posted on:{" "}
            {new Date(post._creationTime).toLocaleDateString("en-US")}
          </p>

          {userId && <PostPresence roomId={post._id} userId={userId} />}
        </div>
      </div>

      <Separator className="my-8" />

      <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
        {post.body}
      </p>

      <Separator className="my-8" />

      <CommentSection preloadedComments={preloadedComments} />
    </div>
  );
}
