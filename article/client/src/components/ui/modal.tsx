import type { ReactNode } from "react";
import { Button } from "./button";

type ModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmHidden?: boolean;
  confirmDisabled?: boolean;
  panelClassName?: string;
  onConfirm: () => void;
  onClose: () => void;
  children?: ReactNode;
};

export function Modal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmHidden = false,
  confirmDisabled = false,
  panelClassName,
  onConfirm,
  onClose,
  children
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 px-4 backdrop-blur-sm">
      <div className={`surface w-full max-w-lg p-6 ${panelClassName ?? ""}`}>
        <h3 className="font-display text-2xl text-ink">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
        {children ? <div className="mt-4">{children}</div> : null}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          {!confirmHidden ? (
            <Button onClick={onConfirm} disabled={confirmDisabled}>
              {confirmLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
