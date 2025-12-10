import * as React from "react";
import { Input } from "./input";
import { Label } from "./label";
import { cn } from "@/lib/utils";

interface InputWithLabelProps extends React.ComponentProps<"input"> {
  label?: string;
  error?: string;
}

function InputWithLabel({ label, error, className, id, ...props }: InputWithLabelProps) {
  const inputId = id || React.useId();

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={inputId} className="text-sm font-medium">
          {label}
        </Label>
      )}
      <Input
        id={inputId}
        className={cn(error && "border-destructive", className)}
        {...props}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

export { InputWithLabel };
