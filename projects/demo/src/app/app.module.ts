import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TimelineModule } from '@bespunky/angular-timeline/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        TimelineModule
    ],
    providers: [],
    bootstrap: [AppComponent],
    schemas  : [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
