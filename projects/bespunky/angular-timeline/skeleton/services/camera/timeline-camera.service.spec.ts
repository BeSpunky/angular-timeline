import { TestBed } from '@angular/core/testing';

import { TimelineCameraService } from './timeline-camera.service';

describe('TimelineCameraService', () => {
  let service: TimelineCameraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimelineCameraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
