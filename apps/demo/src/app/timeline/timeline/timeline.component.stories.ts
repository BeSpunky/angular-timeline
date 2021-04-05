import { Meta, moduleMetadata, Story } from '@storybook/angular';

import { TimelineModule    } from '@bespunky/angular-timeline/core';
import { TimelineComponent } from './timeline.component';

export default {
    title     : 'TimelineComponent',
    decorators: [
        moduleMetadata({
            declarations: [TimelineComponent],
            imports     : [TimelineModule]
        })
    ],
    component: TimelineComponent,
    argTypes: {
        date                : { name: 'Date'                   , defaultValue: new Date(), control: { type: 'date'   } },
        zoom                : { name: 'Zoom Level'             , defaultValue: 0         , control: { type: 'range', min: -250, max: 250 } },
        baseTickSize        : { name: 'Base Tick Size'         , defaultValue: 1         , control: { type: 'range', min: 0.01 } },
        moveAmount          : { name: 'Move Amount'            , defaultValue: 1         , control: { type: 'range', min: 1, max: 10, step: 0.5 }},
        moveOnKeyboard      : { name: 'Move On Keyboard'       , defaultValue: true      , control: { type: 'boolean' }},
        moveOnWheel         : { name: 'Move On Wheel'          , defaultValue: true      , control: { type: 'boolean' }},
        virtualizationBuffer: { name: 'Virtualization Buffer'  , defaultValue: 0.5       , control: { type: 'range', min: 0.1, max: 3, step: 0.1 }},
        zoomDeltaFactor     : { name: 'Zoom Delta Factor'      , defaultValue: 1.06      , control: { type: 'range', min: 1.01, max: 3, step: 0.01 }},
        zoomOnKeyboard      : { name: 'Zoom On Keyboard'       , defaultValue: true      , control: { type: 'boolean' }},
        zoomOnWheel         : { name: 'Zoom On Wheel'          , defaultValue: true      , control: { type: 'boolean' }}
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

export const MouseDisabled = BaseStory.bind({});
MouseDisabled.storyName = 'Mouse Disabled';
MouseDisabled.args = { moveOnWheel: false, zoomOnWheel: false };

export const KeyboardDisabled = BaseStory.bind({});
KeyboardDisabled.storyName = 'Keyboard Disabled';
KeyboardDisabled.args = { moveOnKeyboard: false, zoomOnKeyboard: false };

export const ExtraLargeVirtualizationBuffer = BaseStory.bind({});
ExtraLargeVirtualizationBuffer.storyName = 'Extra Large Virtualization Buffer';
ExtraLargeVirtualizationBuffer.args = { virtualizationBuffer: 5 };
