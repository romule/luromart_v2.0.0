"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { registerParent, loginParent } from "@/actions/auth";

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

export default function AuthSheet({
  onOpenDialog,
}: {
  onOpenDialog?: () => void;
}) {
  const [isLogin, setIsLogin] = React.useState(true);
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", phone: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (!isLogin) {
        await registerParent(values);
        setIsOpen(false);
        router.push("/dashboard");
      } else {
        await loginParent(values);
        setIsOpen(false);
        router.push("/dashboard");
      }
    } catch (error: any) {
      alert(error.message || "Something went wrong.");
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && onOpenDialog) {
      onOpenDialog(); // Closes the mobile menu automatically when the modal pops up
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {/* FIXED: Removed asChild and mapped the Button styles directly to the Trigger */}
      <DialogTrigger
        className={`${buttonVariants({ variant: "default" })} w-full md:w-auto h-14 md:h-10 text-lg md:text-sm px-8 md:px-5 cursor-pointer font-bold tracking-wide shadow-md`}
      >
        Client Portal
      </DialogTrigger>

      <DialogContent className="theme-dashboard sm:max-w-[425px] p-6 bg-background border-border text-foreground z-[100]">
        <DialogHeader className="mb-4 text-center">
          <DialogTitle className="text-2xl font-bold">
            {isLogin ? "Welcome Back" : "Create Account"}
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
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
                        <Input
                          placeholder="Jane Doe"
                          className="bg-background border-input"
                          {...field}
                        />
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
                        <Input
                          placeholder="(902) 555-0123"
                          className="bg-background border-input"
                          {...field}
                        />
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
                    <Input
                      placeholder="name@example.com"
                      className="bg-background border-input"
                      {...field}
                    />
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
                      className="bg-background border-input"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="w-full flex justify-center mt-6">
              <Button
                type="submit"
                className="w-full sm:w-auto h-12 px-8 text-base transition-all duration-200 active:scale-95 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
              >
                {isLogin ? "Sign In" : "Register"}
              </Button>
            </div>
          </form>
        </Form>
        <div className="mt-4 pt-4 border-t border-border text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="sm:w-auto ml-1 font-semibold text-primary cursor-pointer transition-all duration-200 hover:text-primary/80 hover:underline hover:underline-offset-2 active:scale-95"
          >
            {isLogin ? "Register here." : "Sign in."}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
