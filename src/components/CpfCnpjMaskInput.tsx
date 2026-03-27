import { Input } from "@/components/ui/input";
import { forwardRef } from "react";

function applyCpfCnpjMask(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  if (digits.length <= 11) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  if (digits.length <= 13) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

interface CpfCnpjMaskInputProps extends Omit<React.ComponentProps<"input">, "onChange"> {
  value: string;
  onChange: (value: string) => void;
}

const CpfCnpjMaskInput = forwardRef<HTMLInputElement, CpfCnpjMaskInputProps>(
  ({ value, onChange, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="tel"
        inputMode="numeric"
        value={applyCpfCnpjMask(value)}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 14))}
        placeholder="000.000.000-00"
        {...props}
      />
    );
  }
);
CpfCnpjMaskInput.displayName = "CpfCnpjMaskInput";

export { CpfCnpjMaskInput, applyCpfCnpjMask };
