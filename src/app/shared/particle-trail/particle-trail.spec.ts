import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticleTrail } from './particle-trail';

describe('ParticleTrail', () => {
  let component: ParticleTrail;
  let fixture: ComponentFixture<ParticleTrail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParticleTrail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParticleTrail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
