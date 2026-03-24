import { TestBed } from '@angular/core/testing';
import { ProfileHoverService } from './profile-hover-service.service';


describe('ProfileHoverServiceService', () => {
  let service: ProfileHoverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfileHoverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
