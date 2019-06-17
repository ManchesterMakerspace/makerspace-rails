import utils from "./common";
import { By, WebElement } from "selenium-webdriver";

export class TablePageObject {
  private tableId: string;
  private fields: string[];

  constructor(tableId: string, fields: string[]) {
    this.tableId = tableId;
    this.fields = fields;
  }

  public getErrorRowId = (): string => `#${this.tableId}-error-row`;
  public getNoDataRowId = (): string => `#${this.tableId}-no-data-row`;
  public getLoadingId = (): string => `#${this.tableId}-loading`;
  public getSelectAllId = (): string => `#${this.tableId}-select-all`;
  public getTitleId = (): string => `#${this.tableId}-title`;
  public getSearchInputId = (): string => `#${this.tableId}-search-input`;

  public getHeaderIds = (fields: string[]) => ({
    ...fields.reduce((headers: any, field) => ({
      ...headers,
      [field]: `#${this.tableId}-${field}-header`
    }), {})
  });

  public getRowBaseId = (rowId: string): string => `${this.tableId}-${rowId}`;
  public getRow = async (rowId: string):  Promise<WebElement> => await browser.findElement(By.id(`${this.getRowBaseId(rowId)}-row`));
  public getAllRows = async (): Promise<WebElement[]> => await browser.findElements(By.css(`[id^="${this.tableId}-"][id$="-row"]`));

  public getColumnIds = (fields: string[], rowId: string): { [key: string]: string } => ({
    ...fields.reduce((columns: { [key: string]: string }, field) => ({
      ...columns,
      [field]: `#${this.getRowBaseId(rowId)}-${field}`
    }), {})
  });
  public getColumnText = async (field: string, rowId: string): Promise<string> => {
    return await utils.getElementText(`#${this.getRowBaseId(rowId)}-${field}`);
  }
  public selectRow = async (rowId: string, check: boolean = true) => {
    const element: WebElement = browser.findElement(By.css(`#${this.getRowBaseId(rowId)}-select`));
    await utils.selectCheckbox(element, check);
  }

  public getRowByIndex = async (index: number): Promise<WebElement> => {
    const rows = await this.getAllRows();
    return rows[index];
  };

  public selectRowByIndex = async (index: number, check: boolean = true): Promise<void> => {
    const row = await this.getRowByIndex(index);
    const element: WebElement = row.findElement(By.css(`[id$="-select"]`));
    await utils.selectCheckbox(element, check);
  }

  public getColumnByIndex = async (index: number, field: string): Promise<WebElement> => {
    const row = await this.getRowByIndex(index);
    const column = await row.findElement((By.css(`[id$="-${field}"]`)));
    return column;
  } 

  public getColumnTextByIndex = async (index: number, field: string): Promise<string> => {
    const column = await this.getColumnByIndex(index, field);
    const text = await column.getText();
    return text;
  }

  public verifyFieldsByIndex = async <T extends { id: string }>(
    index: number,
    resource: T | Partial<T>,
    fieldEvaluator: Function
  ): Promise<void> => {
    const fieldsContent: { field: string, text: string }[] = await Promise.all((this.fields as string[]).map((field: string) => {
      return new Promise(async (resolve) => {
        const text =  await this.getColumnTextByIndex(index, field);
        resolve({
          field,
          text
        });
      }) as Promise<{ field: string, text: string }>;
    }));

    fieldsContent.forEach(fieldEvaluator(resource));
  }

  public verifyFields = async <T extends { id: string }>(
    resource: T | Partial<T>,
    fieldEvaluator: Function
  ): Promise<void> => {
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

  public verifyListView = async (resourceList: any[], fieldEvaluator: Function): Promise<void> => {
    expect((await this.getAllRows()).length).toEqual(resourceList.length);

    await Promise.all(resourceList.slice(0, 5).map(async (resource) => {
      await this.verifyFields(resource, fieldEvaluator);
    }));
  }
}