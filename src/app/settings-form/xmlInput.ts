export class XmlInput {
  labelName: string;
  inputType: string;
  selectOption1: string;
  selectOption2: string;
  selectOption3: string;
  editing: boolean;
  value: any;

  constructor(
    labelName: string,
    inputType: string,
    selectOption1: string,
    selectOption2: string,
    selectOption3: string,
    editing = false,
    value: any
  ) {
    this.labelName = labelName;
    this.inputType = inputType;
    this.selectOption1 = selectOption1;
    this.selectOption2 = selectOption2;
    this.selectOption3 = selectOption3;
    this.editing = editing;
    this.value = value;
  }
}
