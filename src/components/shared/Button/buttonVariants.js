import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-black transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e67e22]/40 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        primary: "bg-[#e67e22] text-white shadow-lg hover:brightness-110",
        secondary: "bg-[#154d7d] text-white shadow-lg hover:brightness-110",
        danger: "bg-[#d43e0b] text-white shadow-lg hover:brightness-110",
        muted: "bg-gray-100 text-gray-700 hover:bg-gray-200",
        ghost: "text-gray-700 hover:bg-black/5",
        outline: "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
      },
      size: {
        sm: "h-9 rounded-xl px-4 text-sm",
        md: "h-11 rounded-2xl px-5 text-sm",
        lg: "h-14 rounded-3xl px-8 text-lg",
        icon: "h-11 w-11 rounded-2xl p-0",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);
