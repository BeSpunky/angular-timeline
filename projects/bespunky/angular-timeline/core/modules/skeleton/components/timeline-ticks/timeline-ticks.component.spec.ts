import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineTicksComponent } from './timeline-ticks.component';

describe('TimelineTicksComponent', () => {
  let component: TimelineTicksComponent;
  let fixture: ComponentFixture<TimelineTicksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimelineTicksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineTicksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
