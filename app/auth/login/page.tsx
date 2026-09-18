"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mail01Icon,
  LockPasswordIcon,
  ViewIcon,
  ViewOffSlashIcon,
  ArrowRight01Icon,
  ShieldCheckIcon,
} from "@hugeicons/core-free-icons";
import { useAuth } from "@/context/AuthContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/common/Button";

const NOTICE = "This dashboard is restricted to authorised Karevo staff and is logged and audited.";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      setError("Email and password are both required.");
      return;
    }

    setError("");
    setLoading(true);
    // Simulated network delay for the mock login call
    setTimeout(() => {
      const success = login(email.trim(), password);
      setLoading(false);
      if (success) {
        router.replace("/");
      } else {
        setError("Email and password are both required.");
      }
    }, 500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 flex size-11 items-center justify-center rounded-full bg-primary">
            <Image src="/karevo-mark.png" alt="" width={22} height={22} />
          </span>
          <h1 className="mb-1.5 text-2xl font-semibold text-foreground">Super Admin sign in</h1>
          <p className="text-sm text-muted-foreground">{NOTICE}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <HugeiconsIcon
                icon={Mail01Icon}
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@karevo.app"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-full pl-9"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <HugeiconsIcon
                icon={LockPasswordIcon}
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-full pl-9 pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <HugeiconsIcon icon={showPassword ? ViewOffSlashIcon : ViewIcon} size={16} />
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button
            type="submit"
            loading={loading}
            className="h-auto w-full rounded-full py-2.5"
          >
            {!loading && "Sign in"}
            {!loading && <HugeiconsIcon icon={ArrowRight01Icon} size={16} />}
          </Button>
        </form>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <HugeiconsIcon icon={ShieldCheckIcon} size={14} />
          MFA required · Access is reason-coded and audited
        </div>
      </div>
    </div>
  );
}
