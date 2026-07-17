"use client";

import type * as React from "react";

import { cn } from "@/lib/utils";

function AspectRatio({
  ratio = 1,
  className,
  style,
  ...props
}: React.ComponentProps<"div"> & { ratio?: number }) {
  return (
    <div
      data-slot="aspect-ratio"
      style={{ aspectRatio: ratio, ...style }}
      className={cn(className)}
      {...props}
    />
  );
}

export { AspectRatio };
