import { cn } from "@/lib/utils";

export const Highlight = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={cn(
        "font-semibold text-yellow-300",
        className
      )}
    >
      {children}
    </span>
  );
};
