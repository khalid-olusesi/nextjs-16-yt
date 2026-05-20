import { mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { authComponent } from "./auth";

export const createPost = mutation({
  args: { title: v.string(), body: v.string() },
  handler: async (ctx, args) => {
    const user = (await authComponent.safeGetAuthUser(ctx)) as {
      _id: string;
    };

    if (!user) {
      throw new ConvexError(JSON.stringify(user));
    }
    const blogArticle = await ctx.db.insert("posts", {
      body: args.body,
      title: args.title,
      authorId: user._id,
    });
    return blogArticle;
  }, // here we create what we want to see on the client side, and save it in the database, our schema.ts post we craeted is used as the table and we also make sure only authenticated users can create new blog article with      const user = await authComponent.safeGetAuthUser(ctx);
});
