import { TestBed } from '@angular/core/testing';

import { QuarryProductionService } from './quarry-production.service';

describe('QuarryProductionService', () => {
  let service: QuarryProductionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuarryProductionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
