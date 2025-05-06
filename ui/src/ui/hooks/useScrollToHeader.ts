import * as React from "react";

export const useScrollToHeader = (): { executeScroll: () => void } => {
  const executeScroll = React.useCallback(() => {
    document.getElementById("menu-button").scrollIntoView();
  }, []);
  return { executeScroll };
}