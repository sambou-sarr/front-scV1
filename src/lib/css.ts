import type { CSSProperties } from "react";

/** Variables CSS passées en style inline (--i, --w…) : style={cssVars({ '--i': 2 })}. */
export const cssVars = (
  v: Record<string, string | number | undefined>
): CSSProperties => v as CSSProperties;
