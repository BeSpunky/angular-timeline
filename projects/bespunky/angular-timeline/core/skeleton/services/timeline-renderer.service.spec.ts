import { TestBed } from '@angular/core/testing';

import { TimelineRendererService } from './timeline-renderer.service';

describe('TimelineRendererService', () => {
  let service: TimelineRendererService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimelineRendererService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
