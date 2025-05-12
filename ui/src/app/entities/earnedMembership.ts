import { ReportRequirement } from "makerspace-ts-api-client";

export const isReportRequirement = (item: any): item is ReportRequirement =>
  item !== undefined && item.requirementId !== undefined;
