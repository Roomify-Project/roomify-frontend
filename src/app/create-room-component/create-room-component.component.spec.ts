import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRoomComponentComponent } from './create-room-component.component';

describe('CreateRoomComponentComponent', () => {
  let component: CreateRoomComponentComponent;
  let fixture: ComponentFixture<CreateRoomComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateRoomComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateRoomComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
