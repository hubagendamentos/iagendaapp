import { Input } from "@/components/ui/input";
import { forwardRef } from "react";

function applyPhoneMask(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

interface PhoneMaskInputProps extends Omit<React.ComponentProps<"input">, "onChange"> {
  value: string;
  onChange: (value: string) => void;
}

const PhoneMaskInput = forwardRef<HTMLInputElement, PhoneMaskInputProps>(
  ({ value, onChange, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="tel"
        inputMode="numeric"
        value={applyPhoneMask(value)}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        placeholder="(11) 99999-9999"
        {...props}
      />
    );
  }
);
PhoneMaskInput.displayName = "PhoneMaskInput";

export { PhoneMaskInput, applyPhoneMask };
