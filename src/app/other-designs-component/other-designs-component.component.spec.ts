import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherDesignsComponentComponent } from './other-designs-component.component';

describe('OtherDesignsComponentComponent', () => {
  let component: OtherDesignsComponentComponent;
  let fixture: ComponentFixture<OtherDesignsComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtherDesignsComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherDesignsComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
