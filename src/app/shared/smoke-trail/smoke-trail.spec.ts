import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmokeTrail } from './smoke-trail';

describe('SmokeTrail', () => {
  let component: SmokeTrail;
  let fixture: ComponentFixture<SmokeTrail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmokeTrail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmokeTrail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
