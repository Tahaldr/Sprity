import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (

    <input
        type={type}
        data-slot="input"
        className={cn(
"border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-10 w-full min-w-0 rounded-sm border bg-transparent text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
type === "file" ? "file:h-full file:px-5 file:mr-4 file:rounded-sm file:rounded-r-none file:border-0 file:bg-muted file:text-muted-foreground file:text-sm file:font-medium" : "px-3 py-1", // ← Apply paddings only when it's not file
"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    className
  )}
  {...props}
/>

  )
}

export { Input }
