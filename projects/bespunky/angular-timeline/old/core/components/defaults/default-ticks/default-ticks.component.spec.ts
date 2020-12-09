import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultTicksComponent } from './default-ticks.component';

describe('DefaultTicksComponent', () => {
  let component: DefaultTicksComponent;
  let fixture: ComponentFixture<DefaultTicksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefaultTicksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultTicksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
