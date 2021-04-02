import { TestBed } from '@angular/core/testing';

import { TimelineStateService } from './timeline-state.service';

describe('TimelineStateService', () => {
  let service: TimelineStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimelineStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
