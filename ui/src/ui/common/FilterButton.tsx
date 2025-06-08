import * as React from  "react";
import FilterList from "@material-ui/icons/FilterList";
import Button from "@material-ui/core/Button";
import Drawer from "@material-ui/core/Drawer";
import useModal from "../hooks/useModal";

const FilterButton: React.FC<{ label?: string, children(close: () => void): React.ReactChild }> = ({ children, label = "Filters" }) => {
  const { isOpen, openModal, closeModal } = useModal();

  return (
    <>
      <Button
        variant="contained"
        color="default"
        onClick={openModal}
      >
        {label}
        <FilterList />
      </Button>
      <Drawer anchor="right" open={isOpen} onClose={closeModal}>
        <div
          role="presentation"
          style={{ margin: "2em" }}
        >
          {children(closeModal)}
        </div>
      </Drawer>
    </>

  );
};

export default FilterButton;

export const withFilterButton = <P extends { close: () => void }>(
  Component: React.ComponentType<P>,
  label?: string
): React.FC<Omit<P, "close">> => (props: P & { close?: never }) =>(
  <FilterButton label={label}>
    {close => (
      <Component close={close} {...props}  />
    )}
  </FilterButton>
);