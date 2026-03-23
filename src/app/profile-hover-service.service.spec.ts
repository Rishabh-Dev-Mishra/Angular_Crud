import { TestBed } from '@angular/core/testing';

import { ProfileHoverServiceService } from './profile-hover-service.service';

describe('ProfileHoverServiceService', () => {
  let service: ProfileHoverServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfileHoverServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
