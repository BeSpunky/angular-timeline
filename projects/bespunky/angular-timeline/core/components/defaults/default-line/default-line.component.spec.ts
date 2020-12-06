import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultLineComponent } from './default-line.component';

describe('DefaultLineComponent', () => {
  let component: DefaultLineComponent;
  let fixture: ComponentFixture<DefaultLineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefaultLineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
