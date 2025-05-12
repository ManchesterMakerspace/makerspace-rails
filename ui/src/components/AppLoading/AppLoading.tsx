import * as React from "react";
import Typography from "@material-ui/core/Typography";
import LogoInterior from "../../assets/LogoInterior.svg";
import LogoOutline from "../../assets/LogoOutline.svg";

interface Props {
  isLoading: boolean;
}

export const AppLoading: React.FC<Props> = ({ isLoading }) => {
  const [showLoadingText, setShowLoadingText] = React.useState(false);
  const [minRender, setMinRender] = React.useState(isLoading);

  React.useEffect(() => {
    const longLoadingTextTimer = setTimeout(() => {
      setShowLoadingText(true);
    }, 2000);

    // If loading happens too soon, this component will appear to flicker
    const minLoadingTimer = isLoading && setTimeout(() => {
      setMinRender(false)
    }, 6000);


    return () => {
      clearTimeout(longLoadingTextTimer);
      clearTimeout(minLoadingTimer);
    };
  }, []);

  if (!minRender && !isLoading) {
    return null;
  }

  return (
    <>
      <div className="loading-logo">
        <LogoInterior width="200px" height="200px" alt="Manchester Makerspace" />
        <LogoOutline width="200px" height="200px" id="loading-logo-outline" alt="Manchester Makerspace" />
      </div>
      <div className="loading-text">
        {showLoadingText && <Typography align="center" variant="h3">Loading...</Typography>}
      </div>
    </>
    
  );
};
