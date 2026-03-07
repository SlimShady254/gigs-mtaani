type ClassInput = string | undefined | null | false;

export function cn(...inputs: ClassInput[]) {
  return inputs.filter(Boolean).join(" ");
}
