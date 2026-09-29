import { useEffect, useLayoutEffect } from "react";

// useLayoutEffect on the client (runs before paint → no reveal flash),
// useEffect on the server (avoids the SSR warning).
export const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
