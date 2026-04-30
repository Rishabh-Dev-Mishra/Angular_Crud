import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarforsellComponent } from './carforsell.component';

describe('CarforsellComponent', () => {
  let component: CarforsellComponent;
  let fixture: ComponentFixture<CarforsellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarforsellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarforsellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
