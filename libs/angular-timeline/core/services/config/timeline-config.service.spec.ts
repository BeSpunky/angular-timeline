import { TestBed } from '@angular/core/testing';

import { TimelineConfigService } from './timeline-config.service';

describe('TimelineConfigService', () => {
  let service: TimelineConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimelineConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
