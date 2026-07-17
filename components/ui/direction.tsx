"use client";

import {
  DirectionProvider as BaseDirectionProvider,
  useDirection,
} from "@base-ui/react";
import type * as React from "react";

function DirectionProvider({
  dir,
  direction,
  children,
}: {
  dir?: "ltr" | "rtl";
  direction?: "ltr" | "rtl";
  children?: React.ReactNode;
}) {
  return (
    <BaseDirectionProvider direction={direction ?? dir ?? "ltr"}>
      {children}
    </BaseDirectionProvider>
  );
}

export { DirectionProvider, useDirection };
