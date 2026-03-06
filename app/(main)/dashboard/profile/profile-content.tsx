"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const roleLabel: Record<string, string> = {
  ADMIN: "Administrator",
  STOREKEEPER: "Inventory Manager",
  VIEWER: "Viewer",
};

export function ProfileContent({
  user,
}: {
  user: { name: string; email: string; role: string; avatarUrl: string | null };
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fullName, setFullName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState("");
  const [stockAlerts, setStockAlerts] = useState(true);
  const [expiryReminders, setExpiryReminders] = useState(true);
  const [systemUpdates, setSystemUpdates] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("avatar", file);
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setAvatarUrl(data.url);
      router.refresh();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <>
      {/* Profile Header */}
      <div className="flex flex-col gap-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-violet-100 text-2xl font-semibold text-violet-700">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-800">{user.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
              <span className="flex items-center gap-1.5">
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12 12 0 003 12c0 5.523 4.477 10 10 10 5.523 0 10-4.477 10-10 0-1.044-.168-2.053-.482-3.016z" />
                </svg>
                {roleLabel[user.role] ?? user.role}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handlePhotoChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
            {uploading ? "Uploading…" : "Update Photo"}
          </button>
          {uploadError && (
            <p className="text-sm text-red-600" role="alert">{uploadError}</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Personal Information */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold text-zinc-800">
            <span className="flex size-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            Personal Information
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 234-5678"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 placeholder-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>
        </div>

        {/* Security & Authentication */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold text-zinc-800">
            <span className="flex size-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
            Security & Authentication
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Current Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-3 pr-10 text-zinc-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600" aria-label="Toggle visibility">
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 placeholder-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 placeholder-zinc-400 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <div className="flex gap-2 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-600">
              <svg className="size-5 shrink-0 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              <ul className="list-inside list-disc space-y-0.5 text-xs">
                <li>At least 12 characters long</li>
                <li>Include at least one special character</li>
                <li>Unique from previous 3 passwords</li>
              </ul>
            </div>
            <button
              type="button"
              className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700"
            >
              Update Password
            </button>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold text-zinc-800">
            <span className="flex size-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-6-6 6 6 0 00-6 6v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </span>
            Notification Preferences
          </h2>
          <ul className="mt-4 space-y-4">
            <li className="flex items-center justify-between gap-4 rounded-lg border border-zinc-100 p-4">
              <div>
                <p className="font-medium text-zinc-800">Stock Alerts</p>
                <p className="text-sm text-zinc-500">Notify when medicines reach critical levels.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={stockAlerts}
                onClick={() => setStockAlerts(!stockAlerts)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 ${
                  stockAlerts ? "bg-violet-600" : "bg-zinc-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                    stockAlerts ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </li>
            <li className="flex items-center justify-between gap-4 rounded-lg border border-zinc-100 p-4">
              <div>
                <p className="font-medium text-zinc-800">Expiry Reminders</p>
                <p className="text-sm text-zinc-500">Alerts for batches expiring within 30 days.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={expiryReminders}
                onClick={() => setExpiryReminders(!expiryReminders)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 ${
                  expiryReminders ? "bg-violet-600" : "bg-zinc-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                    expiryReminders ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </li>
            <li className="flex items-center justify-between gap-4 rounded-lg border border-zinc-100 p-4">
              <div>
                <p className="font-medium text-zinc-800">System Updates</p>
                <p className="text-sm text-zinc-500">Monthly maintenance and new feature logs.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={systemUpdates}
                onClick={() => setSystemUpdates(!systemUpdates)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 ${
                  systemUpdates ? "bg-violet-600" : "bg-zinc-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                    systemUpdates ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </li>
          </ul>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold text-zinc-800">
            <span className="flex size-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </span>
            Recent Activity
          </h2>
          <ul className="mt-4 space-y-3">
            <li className="flex items-center gap-3 rounded-lg border border-zinc-100 p-4">
              <span className="flex size-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
              <div>
                <p className="font-medium text-zinc-800">Successful login</p>
                <p className="text-sm text-zinc-500">Today, {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
