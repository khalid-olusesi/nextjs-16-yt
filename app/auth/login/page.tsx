"use client";

import { loginSchema } from "@/app/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import z from "zod";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import {
  Field,
  FieldGroup,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onTouched", // show errors after user leaves a field
    defaultValues: {
      email: "",
      password: "",
    }, // so when the page starts initailly it will start empty
  }); // controls the form input

  function onSubmit(data: z.infer<typeof loginSchema>) {
    startTransition(async () => {
      try {
        const response = await authClient.signIn.email({
          email: data.email,
          password: data.password,
          fetchOptions: {
            onSuccess: () => {
              toast.success("Logged in succesfully");
              // Add a small delay to ensure session is established before redirect
              setTimeout(() => {
                router.push("/");
              }, 500);
            },
            onError: (error) => {
              console.error("Login error:", error);
              toast.error(
                error?.error?.message || "Failed to login. Please try again.",
              );
            },
          },
        });

        if (!response) {
          toast.error("Login failed. Please try again.");
        }
      } catch (error) {
        console.error("Unexpected login error:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        );
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Login to get started right away</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-y-4">
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
                  <Loader2 className="size-4 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card> /*gotten from the docs*/
  );
}
