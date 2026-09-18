import type { ComponentProps } from "react";
import { Button as ShadcnButton } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface ButtonProps extends ComponentProps<typeof ShadcnButton> {
  loading?: boolean;
}

// App-level button: the shadcn button with a loading spinner state layered on top
export function Button({ loading = false, disabled, children, ...props }: ButtonProps) {
  return (
    <ShadcnButton disabled={disabled || loading} {...props}>
      {loading && <Spinner className="size-4" />}
      {children}
    </ShadcnButton>
  );
}

