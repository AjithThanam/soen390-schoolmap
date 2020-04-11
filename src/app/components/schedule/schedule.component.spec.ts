import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { NavController } from '@ionic/angular';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ScheduleComponent } from './schedule.component';
import {autoSpy} from "../../../../auto-spy";

describe('ScheduleComponent', () => {
  let component: ScheduleComponent;
  let fixture: ComponentFixture<ScheduleComponent>;

  beforeEach(async(() => {
const a = setup().default();
    TestBed.configureTestingModule({
      declarations: [ ScheduleComponent ],
      imports: [IonicModule.forRoot()]
    }).configureTestingModule({ providers: [{ provide: HttpClient, useValue: a.http },
            { provide: Storage, useValue: a.storage },
            { provide: NavController, useValue: a.navCtrl }] }).compileComponents();

    fixture = TestBed.createComponent(ScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create the schedule component', () => {
    expect(component).toBeTruthy();
  });

});

function setup() {
    const http = autoSpy(HttpClient);
        const storage = autoSpy(Storage);
        const navCtrl = autoSpy(NavController);
        const builder = {
        http,
        storage,
        navCtrl,
        default() {
            return builder;
        },
        build() {
            return new ScheduleComponent(http, storage, navCtrl);
        }
    }
    return builder;
}
