import { TestBed, inject } from '@angular/core/testing';

import { AutoDrawService } from './auto-draw.service';

describe('AutoDrawService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AutoDrawService]
    });
  });

  it('should ...', inject([AutoDrawService], (service: AutoDrawService) => {
    expect(service).toBeTruthy();
  }));
});
