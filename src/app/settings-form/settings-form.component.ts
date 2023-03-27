import {
  Component,
  ViewChild,
  OnInit,
  ElementRef,
  OnDestroy,
  Renderer2,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { XmlService } from '../xml.service';
import { Input } from './input.model';

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

  xmlInputs: {
    labelName: string;
    inputType: string;
    selectOption1: string;
    selectOption2: string;
    selectOption3: string;
    editing: boolean;
    value: any;
  }[] = [];

  @ViewChild('dynamicParagraph', { static: true }) dynamicParagraph: ElementRef;

  showModal = false;

  xmlData: any;

  constructor(
    private http: HttpClient,
    private xmlService: XmlService,
    private renderer: Renderer2
  ) {}

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

  onFileSelected(event: any) {
    console.log('file selected');
    const file: File = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsText(file, 'UTF-8');
    fileReader.onload = () => {
      const parser = new DOMParser();
      const xml = parser.parseFromString(
        fileReader.result as string,
        'text/xml'
      );
      const xmlDataList = xml.getElementsByTagName('add');
      for (let i = 0; i < xmlDataList.length; i++) {
        const labelName = xmlDataList[i].getAttribute('key');
        const value = xmlDataList[i].getAttribute('value');
        const type = xmlDataList[i].getAttribute('InputType');
        if (labelName && value) {
          const selectOption1 =
            xmlDataList[i].getAttribute('selectOption1') || '';
          const selectOption2 =
            xmlDataList[i].getAttribute('selectOption2') || '';
          const selectOption3 =
            xmlDataList[i].getAttribute('selectOption3') || '';
          const editing = false;
          const input: Input = {
            labelName: labelName || '',
            inputType: type || '',
            value: value,
            selectOption1: selectOption1,
            selectOption2: selectOption2,
            selectOption3: selectOption3,
            editing: editing,
          };
          this.xmlInputs.push(input);
        }
      }
    };
  }

  async oFileUploaded() {
    try {
      const inputs = this.inputs;
      for (const input of inputs) {
        const response = await fetch('https://localhost:7149/Xml', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.text();
        if (data) {
          const json = JSON.parse(data);
          console.log('Success:', json);
        } else {
          console.log('Success: Empty response');
          alert('Xml file uploaded');
        }
      }
      this.inputs = [];
      this.labelName = '';
      this.inputType = '';
      this.selectOption1 = '';
      this.selectOption2 = '';
      this.selectOption3 = '';
      this.value = '';
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async onSubmit() {
    this.inputs.push({
      ...this.inputs,
      labelName: this.labelName,
      inputType: this.inputType,
      editing: false,
      selectOption1: this.selectOption1,
      selectOption2: this.selectOption2,
      selectOption3: this.selectOption3,
      value: this.value,
    });
  }

  onClearList() {
    this.inputs = [];
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
    const encoding = 'utf-8';
    let xmlString = `<?xml version="${version}"? encoding="${encoding}">\n  <configuration version="${version}" serverID="${serverID}">\n <appSettings> \n`;
    this.inputs.forEach((input) => {
      xmlString += `<add key="${input.labelName}" value="${input.value}"/>\n`;
    });
    xmlString += '  </appSettings>\n</configuration>';

    // Set the XML string in the textarea inside the modal
    $('#xml-textarea').val(xmlString);

    // Convert the XML string to an XMLDocument object
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
    this.xmlData = xmlDoc;

    // Open the modal
    $('#xml-modal').modal('show');
  }

  onSaveXmlFile() {
    const version = '1.0';
    const configVersion = '2.0';
    const encoding = 'utf-8';
    const serverID = '1234567890';
    let xmlString = `<?xml version="${version}"? encoding="${encoding}">\n  <configuration version="${version}" serverID="${serverID}">\n <appSettings> \n`;
    this.inputs.forEach((input) => {
      xmlString += `    <add key="${input.labelName}" value="${input.value}"/>\n`;
    });
    xmlString += ' </appSettings>\n</configuration>';
    const blob = new Blob([xmlString], { type: 'application/xml' });
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = 'config.xml';
    downloadLink.click();
    URL.revokeObjectURL(downloadLink.href);

    const successMessage = document.createElement('p');
    successMessage.innerHTML = 'Config file saved successfully.';
    document.body.appendChild(successMessage);
  }

  onUploadXmlFile() {
    const xmlString = $('#xml-textarea').val();
    const parser = new DOMParser();
    const xmlData = parser.parseFromString(xmlString, 'application/xml');

    this.xmlService.uploadXmlFile(xmlData).subscribe((response) => {
      console.log('File uploaded successfully', response);
      const message = this.renderer.createText('File uploaded successfully');
      const paragraph = this.renderer.createElement('p');
      this.renderer.appendChild(paragraph, message);
      this.renderer.appendChild(this.dynamicParagraph.nativeElement, paragraph);
    });
  }
  onAddToList(index: number) {
    this.inputs.push(this.xmlInputs[index]);
    this.xmlInputs.splice(index, 1);
  }
}
