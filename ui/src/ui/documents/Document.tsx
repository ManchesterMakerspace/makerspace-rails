import * as React from "react";

import Grid from "@material-ui/core/Grid";

import LoadingOverlay from "../common/LoadingOverlay";
import { FormField } from "../common/Form";

export interface DocDetails extends FormField {
  id: string;
  src: string | ((...args: any) => string);
}

export enum Documents {
  CodeOfConduct = "code-of-conduct",
  MemberContract = "member-contract",
  RentalAgreement = "rental-agreement",
}

const buildDocumentUrl = (documentName: string) => `${process.env.BASE_URL || ""}/api/documents/${documentName}`;
export const documents: { [K in Documents]: DocDetails} = {
  [Documents.MemberContract]: {
    id: Documents.MemberContract,
    src: buildDocumentUrl("member_contract"),
    displayName: "Member Contract",
    name: `${Documents.MemberContract}-checkbox`,
    transform: (val: string) => !!val,
    validate: (val: boolean) => val,
    error: "You must accept to continue",
    label: "I have read and agree to the Manchester Makerspace Member Contract",
  },
  [Documents.CodeOfConduct]: {
    id: Documents.CodeOfConduct,
    src: buildDocumentUrl("code_of_conduct"),
    displayName: "Code of Conduct",
    name: `${Documents.CodeOfConduct}-checkbox`,
    transform: (val: string) => !!val,
    validate: (val: boolean) => val,
    error: "You must accept to continue",
    label: "I have read and agree to the Manchester Makerspace Code of Conduct",
  },
  [Documents.RentalAgreement]: {
    id: Documents.RentalAgreement,
    src: (rentalId: string) => buildDocumentUrl(`rental_agreement?resourceId=${rentalId}`),
    displayName: "Rental Agreement",
    name: `${Documents.RentalAgreement}-checkbox`,
    transform: (val: string) => !!val,
    validate: (val: boolean) => val,
    error: "You must accept to continue",
    label: "I have read and agree to the Manchester Makerspace Rental Agreement",
  },
}

const DocumentFrame: React.FC<Props> = (props) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <DocumentInternalFrame {...props} />
      </Grid>
    </Grid>
  );
}

interface Props { 
  src: string;
  id: string;
  fullHeight?: boolean;
  style?: { [key: string]: any } ;
}

export const DocumentInternalFrame: React.FC<Props> = ({ id, src, style, fullHeight }) => {
  const [loading, setLoading] = React.useState(true);
  const [height, setHeight] = React.useState(style?.height || "300px");

  const onLoad = React.useCallback(() => {
    fullHeight && setHeight((document.getElementById(id) as HTMLIFrameElement).contentWindow.document.documentElement.scrollHeight + "px");
    setLoading(false);
  }, [setLoading]);

  return (
    <>
      {loading && <LoadingOverlay id={id} contained={true}/>}
      <iframe
        id={id}
        name={id}
        src={src}
        style={{ height, width: "100%", overflow: "scroll", ...style }}
        onLoad={onLoad}
        frameBorder={0}
      />
    </>
  )
}

export default DocumentFrame;