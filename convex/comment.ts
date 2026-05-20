import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";
import { ConvexError } from "convex/values";

export const getCommentsByPostId = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const data = await ctx.db
      .query("comments")
      .filter((q) => q.eq(q.field("postId"), args.postId)) // to get a single comment per post eq means equal
      .order("desc")
      .collect();

    return data;
  },
});

export const createComment = mutation({
  args: {
    body: v.string(),
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const user = (await authComponent.safeGetAuthUser(ctx)) as {
      _id: string;
      name: string;
    };

    if (!user) {
      throw new ConvexError("Not Authenticated");
    }

    return await ctx.db.insert("comments", {
      postId: args.postId,
      body: args.body,
      authorId: user._id,
      authorName: user.name,
    });
  },
}); //this is from the from the client allows what the client craetes to be stored   const user = await authComponent.safeGetAuthUser(ctx);

/*  if (!user) {
      throw new ConvexError("Not Authenticated"); this makes sure a user is authenticated
    }*/
