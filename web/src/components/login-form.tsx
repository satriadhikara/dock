"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { signIn } from "@/lib/auth-client";

// Validation schema
const loginSchema = z.object({
  email: z
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    console.log(data);
  };

  const handleGoogleLogin = async () => {
    await signIn.social(
      {
        provider: "google",
        callbackURL:
          typeof window !== "undefined" ? `${window.location.origin}/` : "/",
      },
      {
        onSuccess: () => {
          console.log("Success");
        },
      },
    );
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center  bg-[#2C5AA0]",
        className,
      )}
      {...props}
    >
      <Card className="w-[575px] py-4 lg:p-20 rounded-2xl shadow-lg border-none">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-2">
            <img src="/logo.svg" alt="Dock Logo" className="h-10 w-10" />
            <h1 className="text-[#4EB4E1] font-bold text-lg">DOCK</h1>
          </div>

          <CardTitle className="text-xl mt-3">Welcome to Dock!</CardTitle>
          <CardDescription className="mt-1">
            Login to continue using Dock
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Google Login */}
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center gap-2 rounded-full py-5 cursor-pointer"
                onClick={handleGoogleLogin}
              >
                <img src="/google.svg" alt="Google" className="h-5 w-5" />
                Login with Google
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
