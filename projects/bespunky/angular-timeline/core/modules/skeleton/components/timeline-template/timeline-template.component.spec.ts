import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineTemplateComponent } from './timeline-template.component';

describe('TimelineTemplateComponent', () => {
  let component: TimelineTemplateComponent;
  let fixture: ComponentFixture<TimelineTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimelineTemplateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
