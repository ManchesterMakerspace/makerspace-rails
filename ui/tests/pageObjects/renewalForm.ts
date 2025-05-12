export class RenewalPageObject {

  private renewalFormId = "#renewal-form";
  public renewalForm = {
    id: `${this.renewalFormId}`,
    entity: `${this.renewalFormId}-entity-name`,
    renewalSelect: "#renewal-term",
    renewalOption: "#renewal-option-{OPTION}",
    error: `${this.renewalFormId}-error`,
    termError: "#renewal-term-error",
    submit: `${this.renewalFormId}-submit`,
    cancel: `${this.renewalFormId}-cancel`,
    loading: `${this.renewalFormId}-loading`,
  }
}

export default new RenewalPageObject();