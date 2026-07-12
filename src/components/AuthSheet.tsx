// src/components/AuthSheet.tsx
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { registerParent, loginParent } from "@/actions/auth";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  name: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().optional(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

export default function AuthSheet() {
  // 1. Changed to 'true' so Login is the default view
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

  // 2. The updated submission logic wiring
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (!isLogin) {
        // Handle Registration
        await registerParent(values);
        alert("Success! Your parent portal is created.");
        // Next: We will add the redirect to the Cabinet here soon!
      } else {
        // Handle Login
        await loginParent(values);
        alert("Welcome back! You are logged in.");
        // Next: We will add the redirect to the Cabinet here soon!
      }
    } catch (error: any) {
      alert(error.message || "Something went wrong.");
    }
  }

  return (
    <Sheet>
      <SheetTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 text-slate-50 shadow hover:bg-slate-800 h-10 px-4 py-2">
        Sign In / Register
      </SheetTrigger>

      {/* Added some padding to the content block for breathing room */}
      <SheetContent className="sm:max-w-[400px] p-6 flex flex-col">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl">
            {isLogin ? "Welcome Back" : "Create Account"}
          </SheetTitle>
          <SheetDescription className="text-base">
            {isLogin
              ? "Sign in to manage your student's schedule."
              : "Register for a parent portal to book classes."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1">
          <Form {...form}>
            {/* Increased spacing between form fields */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Taller button with top margin to separate it from inputs */}
              <Button type="submit" className="w-full h-12 mt-4 text-base">
                {isLogin ? "Sign In" : "Register"}
              </Button>
            </form>
          </Form>
        </div>

        {/* Sticky footer toggle */}
        <div className="mt-8 pt-4 border-t text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-slate-600 hover:text-slate-900 font-medium"
          >
            {isLogin
              ? "Don't have an account? Register here."
              : "Already have an account? Sign in."}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
