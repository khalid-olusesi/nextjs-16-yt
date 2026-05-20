"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const posts = useQuery(api.post.getPosts);

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Dashboard
        </h1>
        <p className="text-xl text-muted-foreground pt-4">
          View all blog posts
        </p>
      </div>

      <div className="flex gap-4 justify-center mb-8">
        <Link href="/create" className="underline hover:text-blue-600">
          Create New Post
        </Link>
      </div>

      <div className="w-full max-w-4xl mx-auto">
        {posts === undefined ? (
          <div className="text-center text-muted-foreground">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No posts yet.{" "}
            <Link href="/create" className="underline">
              Create one
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post: any) => (
              <Card key={post._id}>
                <CardHeader>
                  <CardTitle>{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3">
                    {post.body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
