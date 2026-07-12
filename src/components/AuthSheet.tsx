"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { registerParent, loginParent } from "@/actions/auth";

// We swapped the Sheet imports for Dialog imports
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";

const formSchema = z.object({
  name: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().optional(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

export default function AuthSheet() {
  const [isLogin, setIsLogin] = React.useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (!isLogin) {
        await registerParent(values);
        alert("Success! Your parent portal is created.");
        // Next: Redirect to cabinet
      } else {
        await loginParent(values);
        alert("Welcome back! You are securely logged in.");
        // Next: Redirect to cabinet
      }
    } catch (error: any) {
      alert(error.message || "Something went wrong.");
    }
  }

  return (
    <Dialog>
      {/* We apply the Shadcn button styling directly to the Trigger itself */}
      <DialogTrigger className={buttonVariants({ variant: "default" })}>
        Sign In / Register
      </DialogTrigger>

      {/* DialogContent automatically handles the centered positioning, drop-in animation, and dimmed backdrop! */}
      <DialogContent className="sm:max-w-[425px] p-6">
        <DialogHeader className="mb-4 text-center">
          <DialogTitle className="text-2xl font-bold">
            {isLogin ? "Welcome Back" : "Create Account"}
          </DialogTitle>
          <DialogDescription className="text-base text-slate-500">
            {isLogin
              ? "Sign in to manage your student's schedule."
              : "Register for a parent portal to book classes."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!isLogin && (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="(902) 555-0123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full h-12 mt-2 text-base">
              {isLogin ? "Sign In" : "Register"}
            </Button>
          </form>
        </Form>

        <div className="mt-4 pt-4 border-t text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            {isLogin
              ? "Don't have an account? Register here."
              : "Already have an account? Sign in."}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
