import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useMessageContext } from "../context/MessageContext";

/** Clears all messages when the user navigates to a different route. */
export function ClearMessagesOnNavigate() {
  const { clearMessages } = useMessageContext();
  const { pathname, state } = useLocation();
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      if (!(state as { keepMessages?: boolean })?.keepMessages) {
        clearMessages();
      }
    }
  }, [pathname, state, clearMessages]);

  return null;
}
