"use client";

import { signUpSchema } from "@/app/schemas/auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Controller, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";

export default function SignUpPage() {
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(signUpSchema),
    mode: "onTouched", // show errors after user leaves a field
    defaultValues: {
      email: "",
      name: "",
      password: "",
    }, // so when the page starts initailly it will start empty
  }); // controls the form input

  function onSubmit(data: z.infer<typeof signUpSchema>) {
    startTransition(async () => {
      const { data: result, error } = await authClient.signUp.email({
        email: data.email,
        name: data.name,
        password: data.password,

        fetchOptions: {
          onSuccess: () => {
            toast.success("Account created succesfully");
            router.push("/"); // router.push here lets us navigate to the index page after logging
          },
          onError: (error) => {
            toast.error(error.error.message);
          },
        },
      });

      if (error) {
        toast.error(error.message ?? "Something went wrong. Please try again.");
        return;
      }

      toast.success("Account created! Redirecting...");
      router.push("/");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign up</CardTitle>
        <CardDescription>Create an acount to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-y-4">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => {
                return (
                  <Field>
                    <FieldLabel>Full name</FieldLabel>
                    <Input
                      aria-invalid={fieldState.invalid}
                      placeholder="John Doe"
                      {...field}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                );
              }}
            />
            {/* all this are available in the docs of react hook and zod */}

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => {
                return (
                  <Field>
                    <FieldLabel>Email</FieldLabel>
                    <Input
                      aria-invalid={fieldState.invalid}
                      placeholder="John@doe.com"
                      type="email"
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
              name="password"
              control={form.control}
              render={({ field, fieldState }) => {
                return (
                  <Field>
                    <FieldLabel>Password</FieldLabel>
                    <Input
                      aria-invalid={fieldState.invalid}
                      placeholder="****"
                      type="password"
                      {...field}
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
                <span>Sign up</span>
              )}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card> /*gotten from the docs*/
  );
}

// the tags used here were imported both the buttons, inputs etc, they were gotten form the docs not plain html
