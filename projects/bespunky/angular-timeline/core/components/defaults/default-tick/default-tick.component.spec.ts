import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultTickComponent } from './default-tick.component';

describe('DefaultTickComponent', () => {
  let component: DefaultTickComponent;
  let fixture: ComponentFixture<DefaultTickComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefaultTickComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultTickComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
