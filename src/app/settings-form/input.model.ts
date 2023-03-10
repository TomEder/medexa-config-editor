export class Input {
  labelName: string;
  inputType: string;
  selectOption1: string;
  selectOption2: string;
  selectOption3: string;
  value: any;
  editing: boolean = false;
  static selectOption2: string | null;
  static selectOption3: string | null;
  static selectOption1: string | null;
  static value: string | null;

  constructor(
    labelName: string,
    inputType: string,
    selectOption1?: string,
    selectOption2?: string,
    selectOption3?: string
  ) {
    this.labelName = labelName;
    this.inputType = inputType;
    this.selectOption1 = selectOption1 || '';
    this.selectOption2 = selectOption2 || '';
    this.selectOption3 = selectOption3 || '';
  }
}
