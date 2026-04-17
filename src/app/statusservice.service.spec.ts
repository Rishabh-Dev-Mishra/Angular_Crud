import { TestBed } from '@angular/core/testing';

import { StatusserviceService } from './statusservice.service';

describe('StatusserviceService', () => {
  let service: StatusserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatusserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
