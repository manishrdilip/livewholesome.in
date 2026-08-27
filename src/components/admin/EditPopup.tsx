"use client";

import { useRef, type ReactNode } from "react";

export function EditPopup({
  triggerLabel,
  triggerClassName,
  children,
}: {
  triggerLabel: string;
  triggerClassName?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        className={triggerClassName}
        onClick={() => ref.current?.showModal()}
      >
        {triggerLabel}
      </button>
      <dialog
        ref={ref}
        className="w-full max-w-md rounded-xl border border-ink/10 bg-white p-5 backdrop:bg-ink/40"
      >
        {children}
        <button
          type="button"
          onClick={() => ref.current?.close()}
          className="mt-3 text-xs text-ink/50 hover:text-ink"
        >
          Close
        </button>
      </dialog>
    </>
  );
}
