import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getChoiceLabel(choice: "A" | "B") {
  return choice === "A" ? "Option A" : "Option B";
}
