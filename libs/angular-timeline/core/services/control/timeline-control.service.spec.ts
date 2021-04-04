import { TestBed } from '@angular/core/testing';

import { TimelineControlService } from './timeline-control.service';

describe('TimelineControlService', () => {
  let service: TimelineControlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimelineControlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
