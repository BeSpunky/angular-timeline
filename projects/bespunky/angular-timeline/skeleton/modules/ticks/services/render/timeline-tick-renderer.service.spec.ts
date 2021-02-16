import { TestBed } from '@angular/core/testing';

import { TimelineTickRendererService } from './timeline-tick-renderer.service';

describe('TimelineTickRendererService', () => {
  let service: TimelineTickRendererService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimelineTickRendererService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
