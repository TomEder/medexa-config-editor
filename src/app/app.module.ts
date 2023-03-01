import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { SettingsFormComponent } from './settings-form/settings-form.component';
import { SettingsListComponent } from './settings-list/settings-list.component';
@NgModule({
  declarations: [AppComponent, SettingsFormComponent, SettingsListComponent],
  imports: [BrowserModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
