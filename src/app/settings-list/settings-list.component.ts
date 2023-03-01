import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-settings-list',
  templateUrl: './settings-list.component.html',
  styleUrls: ['./settings-list.component.css']
})
export class SettingsListComponent {
  @Input() inputs: any[];
  @Output() inputDeleted = new EventEmitter<number>();
  @Output() inputUpdated = new EventEmitter<number>();

  labelName: string;
  inputType: string;

  onSubmit() {
    this.inputs.push({ labelName: this.labelName, inputType: this.inputType, editing: false });
    this.labelName = '';
    this.inputType = '';
  }


  onDeleteInput(index: number) {
    this.inputDeleted.emit(index);
  }

  onUpdateInput(index: number) {
    this.inputUpdated.emit(index);
  }

  onEditInput(index: number) {
    this.inputs[index].editing = true;
  }
}
