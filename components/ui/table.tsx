import * as React from "react";
import { cn } from "@/lib/utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="relative w-full overflow-x-auto rounded-base border-2 border-border">
      <table className={cn("w-full caption-bottom text-sm", className)} data-slot="table" {...props} />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead className={cn("bg-main text-main-foreground [&_tr]:border-b-2", className)} data-slot="table-header" {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} data-slot="table-body" {...props} />;
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      className={cn("border-b-2 border-border bg-secondary-background transition-colors hover:bg-secondary data-[state=selected]:bg-secondary", className)}
      data-slot="table-row"
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "h-10 px-3 text-left align-middle font-heading whitespace-nowrap",
        className,
      )}
      data-slot="table-head"
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("p-3 align-middle whitespace-nowrap", className)} data-slot="table-cell" {...props} />;
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
