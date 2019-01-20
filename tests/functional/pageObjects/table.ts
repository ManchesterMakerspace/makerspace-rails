import utils from "../pageObjects/common";
import { By } from "selenium-webdriver";

export class TablePageObject {
  private tableId: string;
  constructor(tableId: string) {
    this.tableId = tableId;
  }

  public getErrorRowId = () => `#${this.tableId}-error-row`;
  public getNoDataRowId = () => `#${this.tableId}-no-data-row`;
  public getLoadingId = () => `#${this.tableId}-loading`;
  public getSelectAllId = () => `#${this.tableId}-select-all`;
  public getTitleId = () => `#${this.tableId}-title`;
  public getSearchInputId = () => `#${this.tableId}-search-input`;

  public getHeaderIds = (fields: string[]) => ({
    ...fields.reduce((headers: any, field) => ({
      ...headers,
      [field]: `#${this.tableId}-${field}-header`
    }), {})
  });

  public getRowBaseId = (rowId: string) => `${this.tableId}-${rowId}`;
  public getRow = async (rowId: string) => await browser.findElement(By.id(`${this.getRowBaseId(rowId)}-row`));
  public getAllRows = async () => await browser.findElements(By.css(`[id^="${this.tableId}-"][id$="-row"]`));

  public getColumnIds = (fields: string[], rowId: string): { [key: string]: string } => ({
    ...fields.reduce((columns: { [key: string]: string }, field) => ({
      ...columns,
      [field]: `#${this.getRowBaseId(rowId)}-${field}`
    }), {})
  });
  public getColumnText = async (field: string, rowId: string): Promise<string> => {
    return await utils.getElementText(`#${this.getRowBaseId(rowId)}-${field}`);
  }
  public selectRow = async (rowId: string) => await utils.clickElement(`#${this.getRowBaseId(rowId)}-select`);
}