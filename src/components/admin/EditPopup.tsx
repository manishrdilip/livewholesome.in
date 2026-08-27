"use client";

import { createContext, useContext, useRef, type ReactNode } from "react";

const DialogCloseContext = createContext<(() => void) | null>(null);

/** Lets a component nested inside an EditPopup's children close that popup (see SubmitButton). */
export function useDialogClose() {
  return useContext(DialogCloseContext);
}

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
  const close = () => ref.current?.close();
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
        <DialogCloseContext.Provider value={close}>{children}</DialogCloseContext.Provider>
        <button type="button" onClick={close} className="mt-3 text-xs text-ink/50 hover:text-ink">
          Close
        </button>
      </dialog>
    </>
  );
}
