import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AngularTimelineComponent } from './angular-timeline.component';

describe('AngularTimelineComponent', () => {
  let component: AngularTimelineComponent;
  let fixture: ComponentFixture<AngularTimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AngularTimelineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AngularTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
