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
      <main className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
        <Card className="p-6">
          <div className="h-6 w-40 animate-pulse rounded bg-[#111111]/20" />
        </Card>
      </main>
    );
  }

  if (!isSignedIn || !user) {
    return (
      <main className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
        <Card className="p-6">
          <p className="font-bold text-[#111111]">You need to sign in.</p>
          <Link className="mt-4 inline-block underline" href="/">
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
    <main className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="font-serif text-4xl font-black leading-none text-[#111111] sm:text-5xl">
          Your profile
        </h1>
        <Link
          className="rounded-md border-2 border-[#111111] bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.1em] shadow-[3px_3px_0_#111111]"
          href="/"
        >
          Back to game
        </Link>
      </div>

      <div className="space-y-5">
        <Card className="p-5 sm:p-6">
          <h2 className="text-lg font-black uppercase tracking-[0.08em] text-[#d64f2f]">
            Account
          </h2>
          <dl className="mt-3 grid gap-2 text-[#111111]">
            <div className="flex flex-wrap items-baseline gap-2">
              <dt className="text-sm font-black uppercase tracking-[0.1em] text-[#4d463a]">
                Name
              </dt>
              <dd className="text-base font-bold">{name}</dd>
            </div>
            <div className="flex flex-wrap items-baseline gap-2">
              <dt className="text-sm font-black uppercase tracking-[0.1em] text-[#4d463a]">
                Email
              </dt>
              <dd className="text-base font-bold">{email}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="text-lg font-black uppercase tracking-[0.08em] text-[#d64f2f]">
            Question pool
          </h2>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-[#4d463a]">
            Refreshing clears your seen history so every active question can
            appear again.
          </p>
          <div className="mt-4">
            <Button disabled={refreshing} onClick={handleRefreshPool} variant="secondary">
              {refreshing ? "Refreshing..." : "Refresh pool"}
            </Button>
          </div>
          {poolBanner ? (
            <p className={bannerClass(poolBanner.kind)}>{poolBanner.message}</p>
          ) : null}
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="text-lg font-black uppercase tracking-[0.08em] text-[#d64f2f]">
            {hasPassword ? "Change password" : "Set a password"}
          </h2>
          <form className="mt-3 space-y-3" onSubmit={handleChangePassword}>
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
            <Button disabled={savingPassword} type="submit" variant="primary">
              {savingPassword ? "Saving..." : "Update password"}
            </Button>
          </form>
          {passwordBanner ? (
            <p className={bannerClass(passwordBanner.kind)}>{passwordBanner.message}</p>
          ) : null}
        </Card>

        <Card className="border-[#d64f2f] p-5 sm:p-6">
          <h2 className="text-lg font-black uppercase tracking-[0.08em] text-[#d64f2f]">
            Danger zone
          </h2>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-[#4d463a]">
            Deleting your account removes your sign-in and your seen history. Your
            past votes stay counted.
          </p>
          <div className="mt-4">
            <Button
              className="border-2 border-[#111111] bg-[#d64f2f] text-white shadow-[0_8px_0_#111111] hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_4px_0_#111111]"
              disabled={deleting}
              onClick={handleDeleteAccount}
              variant="secondary"
            >
              {deleting ? "Deleting..." : "Delete account"}
            </Button>
          </div>
          {deleteBanner ? (
            <p className={bannerClass(deleteBanner.kind)}>{deleteBanner.message}</p>
          ) : null}
        </Card>
      </div>
    </main>
  );
}

function bannerClass(kind: "ok" | "error") {
  return [
    "mt-4 rounded-md border-2 border-[#111111] px-4 py-3 text-sm font-black text-[#111111] shadow-[4px_4px_0_#111111]",
    kind === "ok" ? "bg-[#9fd8cb]" : "bg-[#ffe0d7]"
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
      <span className="mb-1 block text-sm font-black uppercase tracking-[0.1em] text-[#4d463a]">
        {label}
      </span>
      <input
        autoComplete="new-password"
        className="w-full rounded-md border-2 border-[#111111] bg-white px-3 py-2 text-base font-bold text-[#111111] shadow-[3px_3px_0_#111111] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#f5c84c]"
        onChange={(event) => onChange(event.target.value)}
        type="password"
        value={value}
      />
    </label>
  );
}
