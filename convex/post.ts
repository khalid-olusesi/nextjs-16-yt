import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { authComponent } from "./auth";
import { Doc } from "./_generated/dataModel";

export const createPost = mutation({
  args: {
    title: v.string(),
    body: v.string(),
    imageStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);

    if (!user) {
      throw new ConvexError("Not Authenticated");
    }

    // Debug: log the user object structure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userObj = user as any;
    console.log("User object keys:", Object.keys(userObj));
    console.log("User object:", JSON.stringify(userObj));

    // Get the user's ID - better-auth in Convex uses '_id' field
    const authorId = userObj._id || userObj.id || userObj.userId;

    if (!authorId) {
      throw new ConvexError(
        "User ID not found. Available keys: " + Object.keys(userObj).join(", "),
      );
    }

    const blogArticle = await ctx.db.insert("posts", {
      body: args.body,
      title: args.title,
      authorId: authorId,
      imageStorageId: args.imageStorageId,
    });
    return blogArticle;
  },
});

export const getPosts = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("posts").order("desc").collect();

    return await Promise.all(
      posts.map(async (posts) => {
        const resolvedImageUrl =
          posts.imageStorageId !== undefined
            ? await ctx.storage.getUrl(posts.imageStorageId)
            : null;

        return {
          ...posts,
          imageUrl: resolvedImageUrl,
        };
      }),
    );
  },
});

export const generateImageUploadurl = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);

    if (!user) {
      throw new ConvexError("Not Authenticated");
    }

    return await ctx.storage.generateUploadUrl();
  },
}); //to add something to the databse or to store soemthing in the database

export const getPostById = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);

    if (!post) {
      return null;
    }

    const resolvedImageUrl =
      post?.imageStorageId !== undefined
        ? await ctx.storage.getUrl(post.imageStorageId)
        : null;

    return {
      ...post,
      imageUrl: resolvedImageUrl,
    };
  },
});

interface searchResultTypes {
  _id: string;
  title: string;
  body: string;
}

export const searchPosts = query({
  args: {
    term: v.string(),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    const limit = args.limit;

    const results: Array<searchResultTypes> = [];
    const seen = new Set();

    const pushDocs = async (docs: Array<Doc<"posts">>) => {
      for (const doc of docs) {
        if (seen.has(doc._id)) continue;

        seen.add(doc._id);
        results.push({
          _id: doc._id,
          title: doc.title,
          body: doc.body,
        });

        if (results.length >= limit) break;
      }
    };

    const titleMatches = await ctx.db
      .query("posts")
      .withSearchIndex("search_title", (q) => q.search("title", args.term))
      .take(limit);

    await pushDocs(titleMatches);

    if (results.length < limit) {
      const bodyMatches = await ctx.db
        .query("posts")
        .withSearchIndex("search_body", (q) => q.search("body", args.term))
        .take(limit);

      await pushDocs(bodyMatches);
    }

    return results;
  },
});
