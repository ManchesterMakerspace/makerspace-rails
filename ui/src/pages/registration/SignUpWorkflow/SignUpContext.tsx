import * as React from "react";

export type BeforeLeave = () => (boolean | Promise<boolean>);

interface SignUpContext {
  setAllowLeave(cb: BeforeLeave): void;
  setNextDisabled(isDisabled?: boolean): void;
  setPrevDisabled(isDisabled?: boolean): void;
  setActiveStep: (newStep: number) => void;
}

export function useAllowLeave(cb: BeforeLeave): void {
  const { setAllowLeave } = useSignUpContext();

  React.useEffect(() => {
    setAllowLeave(cb);
  }, [cb]);
}

const SignUpContext = React.createContext<SignUpContext>({
  setAllowLeave: () => {},
  setNextDisabled: () => {},
  setPrevDisabled: () => {},
  setActiveStep: () => {}
});

export const useSignUpContext = () => {
  return React.useContext(SignUpContext);
}

interface RenderProps {
  allowLeave: BeforeLeave;
  nextDisabled: boolean;
  prevDisabled: boolean;
}

interface Props {
  setActiveStep: (newStep: number) => void;
  children(props: RenderProps): JSX.Element
}

export const SignUpContextProvider: React.FC<Props> = ({ children, setActiveStep }) => {
  const [allowLeave, setAllowLeave] = React.useState<BeforeLeave>();
  const [nextDisabled, setNextDisabled] = React.useState<boolean | undefined>();
  const [prevDisabled, setPrevDisabled] = React.useState<boolean | undefined>();

  const updateAllowLeave = React.useCallback((cb: BeforeLeave) => {
    setAllowLeave(() => async () => {
      setNextDisabled(true);
      setPrevDisabled(true);

      let response: ReturnType<BeforeLeave>;

      try {
        response = await cb();
      } catch (e) {
        throw e;
      } finally {
        setNextDisabled(false);
        setPrevDisabled(false);
      }

      return response;
    });
  }, [setAllowLeave]);

  const context: SignUpContext = React.useMemo(() => {
    return {
      setNextDisabled,
      setPrevDisabled,
      setActiveStep,
      setAllowLeave: updateAllowLeave,
    }
  }, [updateAllowLeave, setNextDisabled, setPrevDisabled, setActiveStep]);

  return (
    <SignUpContext.Provider value={context}>
      {children({ allowLeave, nextDisabled, prevDisabled })}
    </SignUpContext.Provider>
  );
};
