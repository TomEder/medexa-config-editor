import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { XmlInput } from './settings-form/xmlInput';

@Injectable({
  providedIn: 'root',
})
export class XmlService {
  private apiUrl = 'https://localhost:7149/xml/UpdateXmlData';

  constructor(private http: HttpClient) {}

  saveInput(input: XmlInput): Observable<any> {
    return this.http.post<any>(this.apiUrl, input);
  }

  getInputs(): Observable<XmlInput[]> {
    return this.http.get<XmlInput[]>('https://localhost:7149/xml/GetXmlData');
  }
}
