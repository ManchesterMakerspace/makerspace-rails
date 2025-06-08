import * as React from "react";
import generateUUID from "../utils/generateUUID";

export function useUUID(): string {
  const uuid = React.useRef(generateUUID());
  return uuid.current;
}
