import * as React from "react";

const useModal = (onClose?: () => void) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const openModal = React.useCallback(() => setIsOpen(true), [setIsOpen]);
  const closeModal = React.useCallback(() => {
    setIsOpen(false);
    onClose && onClose();
  }, [setIsOpen, onClose]);

  return { isOpen, openModal, closeModal };
}

export default useModal;