import { TestBed } from '@angular/core/testing';

import { PostRefreshService } from './post-refresh.service';

describe('PostRefreshService', () => {
  let service: PostRefreshService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostRefreshService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
