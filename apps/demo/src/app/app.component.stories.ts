
import { moduleMetadata } from '@storybook/angular';
import { AppComponent } from './app.component';
import { AppTimelineModule } from './timeline/timeline.module';

export default {
    title    : 'AppComponent',
    component: AppComponent,
    decorators: [
        moduleMetadata({
            declarations: [AppComponent],
            imports     : [AppTimelineModule],
        })
    ]
}

export const primary = () => ({
  props: {
  }
})