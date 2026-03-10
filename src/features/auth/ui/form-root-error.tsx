"use client";

import { AlertCircleIcon } from "lucide-react";
import type { FieldErrors } from "react-hook-form";

import { Alert, AlertDescription } from "@/shared/ui/alert";

type FormRootErrorProps = {
  errors: FieldErrors;
  className?: string;
};

/**
 * Показывает общую ошибку формы (root), если она задана через setError("root", ...).
 */
export function FormRootError({ errors, className }: FormRootErrorProps) {
  const root = errors.root;
  const message =
    root && typeof root.message === "string"
      ? root.message
      : Array.isArray(root)
        ? root[0]?.message
        : undefined;

  if (!message) return null;

  return (
    <Alert variant="destructive" className={className} role="alert">
      <AlertCircleIcon aria-hidden />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
