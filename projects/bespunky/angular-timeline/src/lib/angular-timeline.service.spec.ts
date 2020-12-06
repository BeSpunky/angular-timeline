import { TestBed } from '@angular/core/testing';

import { AngularTimelineService } from './angular-timeline.service';

describe('AngularTimelineService', () => {
  let service: AngularTimelineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AngularTimelineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
