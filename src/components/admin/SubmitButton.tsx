"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { useDialogClose } from "./EditPopup";

/**
 * Submit button for a server-action form. Shows a "Saving…" state so a save
 * doesn't look stuck, and — when nested inside an EditPopup — closes that
 * popup automatically once the action completes, instead of leaving the
 * admin to close it by hand.
 */
export function SubmitButton({
  children,
  pendingText = "Saving…",
  className,
}: {
  children: ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  const close = useDialogClose();
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending) {
      close?.();
    }
    wasPending.current = pending;
  }, [pending, close]);

  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingText : children}
    </button>
  );
}
