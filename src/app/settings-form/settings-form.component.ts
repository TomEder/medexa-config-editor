import {
  Component,
  ViewChild,
  OnInit,
  ElementRef,
  OnDestroy,
  Renderer2,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { XmlService } from '../xml.service';
import { Input } from './input.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { XmlInput } from './xmlInput';

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

  xmlInputs: {
    labelName: string;
    inputType: string;
    selectOption1: string;
    selectOption2: string;
    selectOption3: string;
    editing: boolean;
    value: any;
  }[] = [];

  inputSuggestions: XmlInput[] = [];

  @ViewChild('dynamicParagraph', { static: true }) dynamicParagraph: ElementRef;

  showModal = false;

  xmlData: any;

  constructor(
    private http: HttpClient,
    private xmlService: XmlService,
    private renderer: Renderer2
  ) {}

  saveInput(): void {
    const input = {
      labelName: this.labelName,
      inputType: this.inputType,
      selectOption1: this.selectOption1,
      selectOption2: this.selectOption2,
      selectOption3: this.selectOption3,
      editing: false,
      value: this.value,
    };
    this.xmlService.saveInput(input).subscribe(() => {
      this.fetchInputs(); // Call fetchInputs to retrieve the latest data after making a POST request
    });
  }

  fetchInputs() {
    const timestamp = new Date().getTime();
    this.http
      .get<XmlInput[]>(
        `https://localhost:7149/xml/GetXmlData?timestamp=${timestamp}`
      )
      .subscribe((data) => {
        this.xmlInputs = data.map((input) => ({
          labelName: input.labelName,
          inputType: input.inputType,
          selectOption1: this.selectOption1,
          selectOption2: this.selectOption2,
          selectOption3: this.selectOption3,
          editing: false,
          value:
            typeof input.value === 'object' && input.value !== null
              ? ''
              : input.value,
        }));
      });
  }

  async ngOnInit(): Promise<void> {
    try {
      const response = await this.http
        .get<XmlInput[]>('https://localhost:7149/xml/GetXmlData')
        .toPromise();
      this.xmlInputs = response!.map((input) => ({
        labelName: input.labelName,
        inputType: input.inputType,
        selectOption1: input.selectOption1,
        selectOption2: input.selectOption2,
        selectOption3: input.selectOption3,
        editing: false,
        value: input.value === null ? '' : input.value, // Add conditional statement here
      }));
      console.log('successful get!', this.xmlInputs);
    } catch (error) {
      console.error(error);
    }
  }

  onAddList() {
    const newInput: XmlInput = {
      labelName: '',
      inputType: 'text',
      selectOption1: '',
      selectOption2: '',
      selectOption3: '',
      editing: false,
      value: '',
    };
    this.http.post('/xml/PostData', newInput).subscribe(() => {
      this.xmlInputs.push(newInput);
    });
  }

  ngOnDestroy() {
    if (this.xmlInputs.length > 0) {
      localStorage.setItem('inputs', JSON.stringify(this.xmlInputs));
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
        if (labelName) {
          const selectOption1 =
            xmlDataList[i].getAttribute('selectOption1') || '';
          const selectOption2 =
            xmlDataList[i].getAttribute('selectOption2') || '';
          const selectOption3 =
            xmlDataList[i].getAttribute('selectOption3') || '';
          const editing = false;
          const input: XmlInput = {
            labelName: labelName || '',
            inputType: type || '',
            value: value,
            selectOption1: selectOption1,
            selectOption2: selectOption2,
            selectOption3: selectOption3,
            editing: editing,
          };
          const existingInputs = this.xmlInputs.filter(
            (xmlInput) => input.labelName === xmlInput.labelName
          );
          if (existingInputs.length > 0) {
            // If an input with the same labelName already exists in the inputs array, update its value and remove the input from xmlInputs
            existingInputs.forEach((existingInput) => {
              existingInput.value = value;
              const xmlIndex = this.xmlInputs.findIndex(
                (input) => input.labelName === existingInput.labelName
              );
              if (xmlIndex !== -1) {
                this.xmlInputs.splice(xmlIndex, 1);
              }
            });
          } else {
            // Otherwise, add the input to xmlInputs
            this.inputSuggestions.push(input);
          }
        }
      }
    };
  }

  onAddToList(index: number) {
    const selectedInput = this.inputSuggestions[index];
    const isDuplicate = this.xmlInputs.some(
      (input) => input.labelName === selectedInput.labelName
    );
    if (isDuplicate) {
      window.alert('Can not add duplicate config');
    } else {
      this.xmlInputs.push(selectedInput);
      this.inputSuggestions.splice(index, 1);
    }
  }

  async onTemplateSave() {
    try {
      const response = await this.http
        .post('https://localhost:7149/Xml/UpdateXmlData', this.xmlInputs)
        .toPromise();
      console.log('Data uploaded successfully:', response, this.xmlInputs);
      // do something after successful upload
      alert('Xml template saved');
    } catch (error) {
      console.error('Error uploading data:', error);
      // handle error
    }
  }

  async onSubmit() {
    const input = {
      labelName: this.labelName,
      inputType: this.inputType,
      editing: false,
      selectOption1: this.selectOption1,
      selectOption2: this.selectOption2,
      selectOption3: this.selectOption3,
      value: this.value,
    };
    console.log('Submitting input:', input);
    this.xmlInputs.push(input);
    this.labelName = '';
    this.inputType = '';
    this.selectOption1 = '';
    this.selectOption2 = '';
    this.selectOption3 = '';
    this.value = '';
  }

  onClearList() {
    this.xmlInputs.forEach((input) => (input.value = ''));
  }

  onClearXmlList() {
    this.xmlInputs = [];
  }

  onSaveSettings() {
    localStorage.setItem('inputs', JSON.stringify(this.xmlInputs));
  }

  onClearConfig() {
    localStorage.clear();
  }

  onEditInput(index: number) {
    this.xmlInputs[index].editing = true;
  }

  onUpdateInput(index: number) {
    this.xmlInputs[index].editing = false;
  }

  onDeleteInput(index: number) {
    this.xmlInputs.splice(index, 1);
    console.log(this.xmlInputs);
  }

  onDeleteFromFirstList(index: number) {
    this.xmlInputs.splice(index, 1);
  }

  onInputChangeType(index: number, inputType: string) {
    this.xmlInputs[index].inputType = inputType;
  }

  onInputChangeLabelName(index: number, labelName: string) {
    this.xmlInputs[index].labelName = labelName;
  }
  onInputChangeSelectOptions(
    index: number,
    selectOption1: string,
    selectOption2: string,
    selectOption3: string
  ) {
    this.xmlInputs[index].selectOption1 = selectOption1;
    this.xmlInputs[index].selectOption2 = selectOption2;
    this.xmlInputs[index].selectOption3 = selectOption3;
  }

  openXmlModal() {
    // Generate XML file with inputs and configuration element
    const version = '1.0';
    const serverID = '1234567890';
    const encoding = 'utf-8';
    let xmlString = `<?xml version="${version}"? encoding="${encoding}">\n  <configuration version="${version}" serverID="${serverID}">\n <appSettings> \n`;
    this.xmlInputs.forEach((input) => {
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
    console.log(this.xmlInputs);
  }

  onSaveXmlFile() {
    const version = '1.0';
    const configVersion = '2.0';
    const encoding = 'utf-8';
    const serverID = '1234567890';
    let xmlString = `<?xml version="${version}"? encoding="${encoding}">\n  <configuration version="${version}" serverID="${serverID}">\n <appSettings> \n`;
    this.xmlInputs.forEach((input) => {
      xmlString += `    <add key="${input.labelName}" value="${input.value}"/>\n`;
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

  /* onUploadXmlFile() {
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
  } */

  onAddFromFirstList(index: number) {
    const selectedInput = this.xmlInputs[index];
    const isDuplicate = this.xmlInputs.some(
      (input) => input.labelName === selectedInput.labelName
    );
    if (isDuplicate) {
      window.alert('Can not add duplicate config');
    } else {
      this.xmlInputs.push(selectedInput);
      this.xmlInputs.splice(index, 1);
    }
  }

  onAddAllXml() {
    this.xmlInputs.push(...this.xmlInputs);
    console.log(this.xmlInputs);
  }
}
