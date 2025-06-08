import * as React from "react";
import Snackbar from "@material-ui/core/Snackbar";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Box from "@material-ui/core/Box";

export enum ToastStatus {
  Success = "#81c784",
  Error = "#e57373",
  Warning = "#ffb74d",
  Info = "#64b5f6"
}

interface CreateToast {
  message: React.ReactNode;
  status?: ToastStatus
  onClose?() :void;
}

interface ToastContext {
  create(props: CreateToast): void;  
}

const ToastContext = React.createContext<ToastContext>({ create: () => {} });
export function useToastContext() {
  return React.useContext(ToastContext);
}

export const ToastContextProvider: React.FC = ({ children }) => {
  const [toastProps, setToastProps] = React.useState<CreateToast>();
  const create = React.useCallback((props: CreateToast) => {
    setToastProps(props);
  }, [setToastProps]);

  const onClose = React.useCallback(() => {
    setToastProps(undefined);
    toastProps?.onClose();
  }, [toastProps?.onClose, setToastProps])

  return (
    <ToastContext.Provider value={{ create }}>
      <Snackbar 
        open={!!toastProps?.message} 
        autoHideDuration={6000} 
        onClose={onClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <div style={{ padding: "1em", backgroundColor: toastProps?.status }}>
          {toastProps?.message}
          <Box textAlign="right" component="span">
            <IconButton size="small" aria-label="close" color="inherit" onClick={onClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </div>
      </Snackbar>
      {children}
    </ToastContext.Provider>
  );
};
