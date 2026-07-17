"use client";

import { useRender } from "@base-ui/react";

import { cn } from "@/lib/utils";

function Label({
  className,
  render,
  ...props
}: useRender.ComponentProps<"label">) {
  return useRender({
    render,
    defaultTagName: "label",
    props: {
      "data-slot": "label",
      className: cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      ),
      ...props,
    },
  });
}

export { Label };
