import { Meta, moduleMetadata, Story } from '@storybook/angular';

import { TimelineModule    } from '@bespunky/angular-timeline/core';
import { TimelineComponent } from './timeline.component';

export default {
    title: 'TimelineComponent',
    decorators: [
        moduleMetadata({
            declarations: [TimelineComponent],
            imports: [TimelineModule],
        }),
    ],
    component: TimelineComponent,
    argTypes: {
        date        : { name: 'Date'          , defaultValue: new Date(), control: { type: 'date'   } },
        zoom        : { name: 'Zoom Level'    , defaultValue: 0         , control: { type: 'range', min: -250, max: 250 } },
        baseTickSize: { name: 'Base Tick Size', defaultValue: 1         , control: { type: 'range', min: 0.01 } },
    },
} as Meta;

const BaseStory: Story<TimelineComponent> = (args) =>
{
    args.date = args.date instanceof Date ? args.date :
                  typeof args.date === 'number' ? new Date(args.date) : new Date();

    return {
        props: args
    };
};

export const CurrentDate = BaseStory.bind({});
CurrentDate.storyName = 'Current Date';

export const ZoomIn = BaseStory.bind({});
ZoomIn.storyName = 'Zoom In';
ZoomIn.args = { zoom: 100 };

export const ZoomOut = BaseStory.bind({});
ZoomOut.storyName = 'Zoom Out';
ZoomOut.args = { zoom: -60 };
