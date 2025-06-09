import { TestBed } from '@angular/core/testing';

import { RoomImageService } from './room-image.service';

describe('RoomImageService', () => {
  let service: RoomImageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoomImageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
