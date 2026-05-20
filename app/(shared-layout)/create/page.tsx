"use client";

import { postSchema } from "@/app/schemas/blog";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import z from "zod";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  FieldGroup,
  FieldLabel,
  FieldError,
  Field,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import { useTransition } from "react";

import { createBlogAction } from "@/app/action";

export default function CreateRoute() {
  const [isPending, startTransition] = useTransition();
  const form = useForm({
    resolver: zodResolver(postSchema),
    mode: "onTouched", // show errors after user leaves a field
    defaultValues: {
      title: "",
      content: "",
      image: undefined,
    }, // so when the page starts initailly it will start empty
  });

  function onSubmit(values: z.infer<typeof postSchema>) {
    startTransition(async () => {
      console.log("Hey this runs on the client side");

      await createBlogAction(values);
    });
  }

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Create Post
        </h1>
        <p className="text-xl text-muted-foreground pt-4">
          share your thoughts with the big world
        </p>
      </div>

      <Card className="w-full max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Create Blog Article</CardTitle>
          <CardDescription>Create a new blog article</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="gap-y-4">
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => {
                  return (
                    <Field>
                      <FieldLabel>Title</FieldLabel>
                      <Input
                        aria-invalid={fieldState.invalid}
                        placeholder="super cool title"
                        {...field}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  );
                }}
              />

              <Controller
                name="content"
                control={form.control}
                render={({ field, fieldState }) => {
                  return (
                    <Field>
                      <FieldLabel>Content</FieldLabel>
                      <Textarea
                        aria-invalid={fieldState.invalid}
                        placeholder="super cool blog content"
                        {...field}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  );
                }}
              />

              <Controller
                name="image"
                control={form.control}
                render={({ field, fieldState }) => {
                  return (
                    <Field>
                      <FieldLabel>Image</FieldLabel>
                      <Input
                        aria-invalid={fieldState.invalid}
                        placeholder="upload your image"
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          field.onChange(file);
                        }}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  );
                }}
              />

              <Button disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="size-4  animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <span>Create Post</span>
                )}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
