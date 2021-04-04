import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AppTimelineModule } from './timeline/timeline.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot([], { initialNavigation: 'enabled' }),

    AppTimelineModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
