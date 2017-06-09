import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { AutoDrawService } from './auto-draw.service';

describe('AutoDrawService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AutoDrawService],
      imports: [
        HttpModule
      ]
    });
  });

  it('should ...', inject([AutoDrawService], (service: AutoDrawService) => {
    expect(service).toBeTruthy();
  }));
});
