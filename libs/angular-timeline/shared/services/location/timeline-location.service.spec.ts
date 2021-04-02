import { TestBed } from '@angular/core/testing';

import { TimelineLocationService } from './timeline-location.service';

describe('TimelineLocationService', () => {
  let service: TimelineLocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimelineLocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
