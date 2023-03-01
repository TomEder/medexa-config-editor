import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class XmlService {
  constructor(private http: HttpClient) {}

  uploadXmlFile(xmlData: any): Observable<any> {
    const url = 'https://localhost:7149/Xml/upload';
    return this.http.post(url, xmlData, {
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}
