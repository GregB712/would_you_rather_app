"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Banner = { kind: "ok" | "error"; message: string } | null;

function errorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === "object" &&
    "errors" in error &&
    Array.isArray((error as { errors?: unknown }).errors)
  ) {
    const first = (error as { errors: Array<{ message?: string }> }).errors[0];
    if (first?.message) {
      return first.message;
    }
  }

  return error instanceof Error ? error.message : fallback;
}

export default function ProfilePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBanner, setPasswordBanner] = useState<Banner>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const [poolBanner, setPoolBanner] = useState<Banner>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [deleting, setDeleting] = useState(false);
  const [deleteBanner, setDeleteBanner] = useState<Banner>(null);

  if (!isLoaded) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-8">
        <Card className="p-6">
          <div className="h-5 w-40 animate-pulse rounded-full bg-fill-strong" />
        </Card>
      </main>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-8">
        <Card className="animate-rise p-6 text-center">
          <p className="text-[17px] font-semibold text-label">You need to sign in.</p>
          <Link className="mt-3 inline-block text-[15px] font-medium text-accent hover:underline" href="/">
            Back to the game
          </Link>
        </Card>
      </main>
    );
  }

  const hasPassword = user.passwordEnabled;
  const email = user.primaryEmailAddress?.emailAddress ?? "No email on file";
  const name = user.fullName ?? user.firstName ?? "Player";

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordBanner(null);

    if (newPassword.length < 8) {
      setPasswordBanner({
        kind: "error",
        message: "New password must be at least 8 characters."
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordBanner({ kind: "error", message: "The new passwords do not match." });
      return;
    }

    setSavingPassword(true);

    try {
      await user.updatePassword({
        newPassword,
        ...(hasPassword ? { currentPassword } : {}),
        signOutOfOtherSessions: true
      });
      setPasswordBanner({ kind: "ok", message: "Password updated." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordBanner({
        kind: "error",
        message: errorMessage(error, "Could not update your password.")
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleRefreshPool = async () => {
    setPoolBanner(null);
    setRefreshing(true);

    try {
      const response = await fetch("/api/pool/refresh", { method: "POST" });

      if (!response.ok) {
        throw new Error("Could not refresh your pool.");
      }

      const data = (await response.json()) as { cleared: number };
      setPoolBanner({
        kind: "ok",
        message:
          data.cleared > 0
            ? `Pool refreshed. ${data.cleared} question${data.cleared === 1 ? "" : "s"} are back in rotation.`
            : "Pool refreshed. Every question is available again."
      });
    } catch (error) {
      setPoolBanner({
        kind: "error",
        message: errorMessage(error, "Could not refresh your pool.")
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Delete your account permanently? This cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setDeleteBanner(null);
    setDeleting(true);

    try {
      await user.delete();
      router.push("/");
    } catch (error) {
      setDeleteBanner({
        kind: "error",
        message: errorMessage(error, "Could not delete your account.")
      });
      setDeleting(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-16 sm:px-8">
      <nav className="pt-[max(1rem,env(safe-area-inset-top))]">
        <Link
          className="-ml-2 inline-flex items-center gap-0.5 rounded-full px-2 py-1.5 text-[17px] text-accent transition-[transform,background-color] duration-150 hover:bg-fill active:scale-[0.96] active:duration-75"
          href="/"
        >
          <svg
            aria-hidden="true"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            viewBox="0 0 20 20"
          >
            <path d="M12.5 4.5 7 10l5.5 5.5" />
          </svg>
          Game
        </Link>
      </nav>

      <header className="animate-rise mt-6 mb-8 flex items-center gap-4">
        <span
          aria-hidden="true"
          className="flex size-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-choice-a to-indigo text-[26px] font-semibold text-white"
        >
          {name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-[34px] font-bold leading-tight tracking-[-0.03em] text-label">
            {name}
          </h1>
          <p className="truncate text-[15px] text-label-2">{email}</p>
        </div>
      </header>

      <div className="space-y-8">
        <Section
          className="animate-rise-delayed"
          footer="Refreshing clears your seen history so every active question can appear again."
          title="Question pool"
        >
          <div className="flex items-center justify-between gap-4 p-4 sm:p-5">
            <span className="text-[17px] text-label">Seen questions</span>
            <Button disabled={refreshing} onClick={handleRefreshPool} variant="secondary">
              {refreshing ? "Refreshing…" : "Refresh pool"}
            </Button>
          </div>
          {poolBanner ? (
            <p className={bannerClass(poolBanner.kind)} role="status">{poolBanner.message}</p>
          ) : null}
        </Section>

        <Section
          className="animate-rise-delayed"
          title={hasPassword ? "Change password" : "Set a password"}
        >
          <form className="p-4 sm:p-5" onSubmit={handleChangePassword}>
            <div className="space-y-3">
              {hasPassword ? (
                <PasswordField
                  label="Current password"
                  onChange={setCurrentPassword}
                  value={currentPassword}
                />
              ) : null}
              <PasswordField
                label="New password"
                onChange={setNewPassword}
                value={newPassword}
              />
              <PasswordField
                label="Confirm new password"
                onChange={setConfirmPassword}
                value={confirmPassword}
              />
            </div>
            <Button className="mt-5 w-full sm:w-auto" disabled={savingPassword} type="submit" variant="primary">
              {savingPassword ? "Saving…" : "Update password"}
            </Button>
          </form>
          {passwordBanner ? (
            <p className={bannerClass(passwordBanner.kind)} role="status">{passwordBanner.message}</p>
          ) : null}
        </Section>

        <Section
          className="animate-rise-delayed-2"
          footer="Deleting your account removes your sign-in and your seen history. Your past votes stay counted."
          title="Danger zone"
        >
          <div className="p-4 sm:p-5">
            <Button
              className="w-full sm:w-auto"
              disabled={deleting}
              onClick={handleDeleteAccount}
              variant="destructive"
            >
              {deleting ? "Deleting…" : "Delete account"}
            </Button>
          </div>
          {deleteBanner ? (
            <p className={bannerClass(deleteBanner.kind)} role="alert">{deleteBanner.message}</p>
          ) : null}
        </Section>
      </div>
    </main>
  );
}

function Section({
  title,
  footer,
  className,
  children
}: {
  title: string;
  footer?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <h2 className="mb-2 px-4 text-[13px] font-medium uppercase tracking-[0.04em] text-label-2">
        {title}
      </h2>
      <Card className="overflow-hidden rounded-[20px]">{children}</Card>
      {footer ? (
        <p className="mt-2 px-4 text-[13px] leading-relaxed text-label-2">{footer}</p>
      ) : null}
    </div>
  );
}

function bannerClass(kind: "ok" | "error") {
  return [
    "mx-4 mb-4 rounded-xl px-4 py-3 text-[15px] font-medium sm:mx-5 sm:mb-5",
    kind === "ok" ? "bg-green/15 text-label" : "bg-danger-fill/12 text-danger"
  ].join(" ");
}

function PasswordField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-label-2">{label}</span>
      <input
        autoComplete="new-password"
        className="w-full rounded-xl bg-fill px-4 py-3 text-[17px] text-label outline-none transition-shadow duration-150 placeholder:text-label-3 focus-visible:ring-2 focus-visible:ring-accent"
        onChange={(event) => onChange(event.target.value)}
        type="password"
        value={value}
      />
    </label>
  );
}
