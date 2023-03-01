import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { XmlService } from '../xml.service';

declare const $: any;

@Component({
  selector: 'app-settings-form',
  templateUrl: './settings-form.component.html',
  styleUrls: ['./settings-form.component.css'],
})
export class SettingsFormComponent implements OnInit, OnDestroy {
  labelName: string;
  inputType: string;
  selectOption1: string;
  selectOption2: string;
  selectOption3: string;
  value: any;
  inputs: {
    labelName: string;
    inputType: string;
    selectOption1: string;
    selectOption2: string;
    selectOption3: string;
    editing: boolean;
    value: any;
  }[] = [];

  xmlData: any;

  constructor(private http: HttpClient, private xmlService: XmlService) {}

  ngOnInit() {
    const storedInputs = localStorage.getItem('inputs');
    if (storedInputs) {
      this.inputs = [...JSON.parse(storedInputs)];
    }
  }

  ngOnDestroy() {
    if (this.inputs.length > 0) {
      localStorage.setItem('inputs', JSON.stringify(this.inputs));
    }
  }

  onSubmit() {
    this.inputs.push({
      labelName: this.labelName,
      inputType: this.inputType,
      editing: false,
      selectOption1: this.selectOption1,
      selectOption2: this.selectOption2,
      selectOption3: this.selectOption3,
      value: this.value,
    });
    console.log(this.inputs);
    this.labelName = '';
    this.inputType = '';
    this.selectOption1 = '';
    this.selectOption2 = '';
    this.selectOption2 = '';
    this.value = '';
    console.log(this.inputs);
  }

  onSaveSettings() {
    localStorage.setItem('inputs', JSON.stringify(this.inputs));
  }

  onClearConfig() {
    localStorage.clear();
  }

  onEditInput(index: number) {
    this.inputs[index].editing = true;
  }

  onUpdateInput(index: number) {
    localStorage.setItem('inputs', JSON.stringify(this.inputs));
    this.inputs[index].editing = false;
  }

  onDeleteInput(index: number) {
    this.inputs.splice(index, 1);
    console.log(this.inputs);
  }

  onInputChangeType(index: number, inputType: string) {
    this.inputs[index].inputType = inputType;
  }

  onInputChangeLabelName(index: number, labelName: string) {
    this.inputs[index].labelName = labelName;
  }
  onInputChangeSelectOptions(
    index: number,
    selectOption1: string,
    selectOption2: string,
    selectOption3: string
  ) {
    this.inputs[index].selectOption1 = selectOption1;
    this.inputs[index].selectOption2 = selectOption2;
    this.inputs[index].selectOption3 = selectOption3;
  }

  openXmlModal() {
    // Generate XML file with inputs and configuration element
    const version = '1.0';
    const serverID = '1234567890';
    let xmlString = `<?xml version="${version}"?>\n<root>\n  <configuration version="${version}" serverID="${serverID}">\n`;
    this.inputs.forEach((input) => {
      xmlString += `    <appSettings>\n      <add>\n        <${input.inputType} name="${input.labelName}">${input.value}</${input.inputType}>\n      </add>\n    </appSettings>\n`;
    });
    xmlString += '  </configuration>\n</root>';

    // Set the XML string in the textarea inside the modal
    $('#xml-textarea').val(xmlString);

    // Convert the XML string to an XMLDocument object
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
    this.xmlData = xmlDoc;

    // Open the modal
    $('#xml-modal').modal('show');
  }

  onUploadXmlFile() {
    const xmlString = $('#xml-textarea').val();
    const parser = new DOMParser();
    const xmlData = parser.parseFromString(xmlString, 'application/xml');

    this.xmlService.uploadXmlFile(xmlData).subscribe((response) => {
      console.log('File uploaded successfully', response);
    });
  }

  uploadXmlFile(xmlData: XMLDocument): Observable<any> {
    const xmlString = new XMLSerializer().serializeToString(
      xmlData.documentElement
    );
    const url = 'https://localhost:7149/Xml/upload';
    return this.http.post(url, xmlString, {
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}
