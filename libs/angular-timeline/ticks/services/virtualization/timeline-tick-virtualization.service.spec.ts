import { TestBed } from '@angular/core/testing';

import { TimelineTickVirtualizationService } from './timeline-tick-virtualization.service';

describe('TimelineTickVirtualizationService', () => {
  let service: TimelineTickVirtualizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimelineTickVirtualizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
