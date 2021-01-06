import { TestBed } from '@angular/core/testing';

import { TimelineToolsService } from './timeline-tools.service';

describe('TimelineToolsService', () => {
  let service: TimelineToolsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimelineToolsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
