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

  public getRow = async (rowId: string) => await browser.findElement(By.id(`${this.tableId}-${rowId}`));
  public getAllRows = async () => await browser.findElements(By.css(`[id^="${this.tableId}-"][id$="-row"]`));

  public getColumnIds = (fields: string[], rowId: string) => ({
    ...fields.reduce((columns: any, field) => ({
      ...columns,
      [field]: `#${this.getRow(rowId)}-${field}`
    }), {})
  });
}