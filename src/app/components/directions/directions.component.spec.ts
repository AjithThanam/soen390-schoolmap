import { MapService } from '../../services/map/map.service';
import { IndoorPathingService } from '../../services/indoorPathing/indoor-pathing.service';
import { BuildingFactoryService } from '../../services/BuildingFactory/building-factory.service';
import { GpsGridMappingService } from '../../services/gps-grid-mapping/gps-grid-mapping.service';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import {Storage} from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage'
import { Geolocation } from '@ionic-native/geolocation/ngx';
import {By} from '@angular/platform-browser';
import { autoSpy } from '../../../../auto-spy';

import { DirectionsComponent } from './directions.component';
import {NO_ERRORS_SCHEMA} from "@angular/core";

describe('DirectionsComponent', () => {
  let component: DirectionsComponent;
  let fixture: ComponentFixture<DirectionsComponent>;

  beforeEach(async(() => {
const a = setup().default();
    TestBed.configureTestingModule({
      declarations: [ DirectionsComponent ],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [IonicModule.forRoot(),  IonicStorageModule.forRoot()],
      providers:[Geolocation]
    }).compileComponents();

    fixture = TestBed.createComponent(DirectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
     expect(component).toBeTruthy();
  });
  /*
it('when setMap is called it should', () => {

    // arrange
    const { build } = setup().default();
    const c = build();
    // act
    c.setMap();
    // assert
    expect(c).toEqual
}); */

it('when isSGW is called it should verify string corresponds to SGW campus', () => {
    expect(component.isSGW("concordia university")).toBeTruthy();
});

it('when isLoyola is called it should verify string corresponds to loyola', () => {
    expect(component.isLoyola("concordia loyola")).toBeTruthy();
});

it('when isSchool is called it should check if is school', () => {
    expect(component.isSchool("concordia")).toBeTruthy();
});

it('when displayShuttle is called it should check if shuttle should be displayed', () => {
  component.directions['start'] = "concordia loyola";
  component.directions['destination'] = "concordia";
  let mockDate = new Date('2020-03-18 10:00')
  jasmine.clock().mockDate(mockDate); 
  expect(component.displayShuttle()).toBeFalsy();
});
/*
it('when isDriving is called it should', () => {
    // arrange
    const { build } = setup().default();
    const c = build();
    // act
    c.isDriving();
    // assert
    // expect(c).toEqual
});

*/
it('when getTransportation is called it should get selected transportation', () => {
    expect(component.getTransportation).toBeTruthy();
});
/*
it('when displayTravelInfo is called it should', () => {
    // arrange
   // const { build } = setup().default();
   // const c = build();
    // act
 //   c.displayTravelInfo();
    // assert
    // expect(c).toEqual
});
*/
it('when validateInput is called it should validate university address', () => {
    expect(component.validateInput("Concordia University")).toBeTruthy();
});
/*
it('when getDirections is called it should', () => {
    // arrange
    const { build } = setup().default();
    const c = build();
    // act
    c.getDirections();
    // assert
    // expect(c).toEqual
});

it('when preformOutdoorDirectionsActivity is called it should', () => {
    // arrange
   // const { build } = setup().default();
    //const c = build();
    // act
   // c.preformOutdoorDirectionsActivity("Concordia loyola", "Sir george williams");
    // assert
    expect(component.preformOutdoorDirectionsActivity("Concordia loyola", "Sir george williams")).toBeTruthy();
});

it('when showClearDirectionControls is called it should', () => {
    // arrange
    const { build } = setup().default();
    const c = build();
    // act
    c.showClearDirectionControls();
    // assert
    // expect(c).toEqual
});

it('when clearDirections is called it should', () => {
    // arrange
    const { build } = setup().default();
    const c = build();
    // act
    c.clearDirections();
    // assert
    // expect(c).toEqual
});

it('when useCurrentLocation is called it should', async () => {
  await component.useCurrentLocation().then( () => {
    const de = fixture.debugElement.query(By.css('#start'));
    console.log(de.nativeElement);
    expect(de.nativeElement.value).toContain(',');
  });

    // act
    // assert
    // expect(c).toEqual
});
*/
it('when getNextShuttleTime is called it should get the next shuttle time', async () => {
    let mockDate = new Date('2020-03-18 10:00')
    jasmine.clock().mockDate(mockDate); 
    let result = await component.getNextShuttleTime("loyola");
    expect(result).toBeTruthy();
});

});

function setup() {
    const geolocation = autoSpy(Geolocation);
        const mapSrevice = autoSpy(MapService);
        const storage = autoSpy(Storage);
        const indoorService = autoSpy(IndoorPathingService);
        const buildFactoryService = autoSpy(BuildingFactoryService);
        const gpsMapService = autoSpy(GpsGridMappingService);
        const builder = {
        geolocation,
        mapSrevice,
        storage,
        indoorService,
        buildFactoryService,
        gpsMapService,
        default() {
            return builder;
        },
        build() {
            return new DirectionsComponent(geolocation, mapSrevice, storage, indoorService, buildFactoryService, gpsMapService);
        }
    };
    return builder;
}