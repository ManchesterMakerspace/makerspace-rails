import utils from "../pageObjects/common";
import { By } from "selenium-webdriver";

export class TablePageObject {
  private tableId: string;
  private fields: string[];

  constructor(tableId: string, fields: string[]) {
    this.tableId = tableId;
    this.fields = fields;
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

  public verifyFields = async <T extends { id: string }>(
    resource: T | Partial<T>,
    fieldEvaluator: Function
  ) => {
    const fieldsContent: { field: string, text: string }[] = await Promise.all((this.fields as string[]).map((field: string) => {
      return new Promise(async (resolve) => {
        const text: string = await this.getColumnText(field, resource.id);
        resolve({
          field,
          text
        });
      }) as Promise<{ field: string, text: string }>;
    }));

    fieldsContent.forEach(fieldEvaluator(resource));
  }

  public verifyListView = async (resourceList: any[], fieldEvaluator: Function) => {
    expect((await this.getAllRows()).length).toEqual(resourceList.length);

    await Promise.all(resourceList.slice(0, 5).map(async (resource) => {
      await this.verifyFields(resource, fieldEvaluator);
    }));
  }
}