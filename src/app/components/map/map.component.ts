import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { IndoorPathingService } from '../../services/indoorPathing/indoor-pathing.service';
import { ReadGridService } from '../../services/readGrid/read-grid.service';
import { Location } from '../../models/Location';
import { Floor } from '../../models/Floor';
import { BuildingFactoryService } from '../../services/BuildingFactory/building-factory.service';
import { Campus } from '../../models/Campus';
import { empty } from 'rxjs';
import { isTabSwitch } from '@ionic/angular/dist/directives/navigation/stack-utils';
import { overlays } from './BuildingOverlayPoints'
import { Variable } from '@angular/compiler/src/render3/r3_ast';
import {Building} from '../../models/Building'
import {IndoorPOI} from '../../models/IndoorPOI'
import { MapService } from '../../services/map/map.service'



declare var google;


/**
 * MapComponent class. Contains the map object and attributes for all google map related services.
 * Also contains data for both campuses and is injected with our services.
 */
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit {

  @ViewChild('googleMap', {static: false}) googleMap: ElementRef;
 
  public map: any; // google.maps.Map
  private userLocation: Location = new Location(0, 0, 0);
  private mapOptions; // Object
  private userMarker; // google.maps.Marker

  private sgw: Campus;
  private loyola: Campus;

  //Color for polygons
  private fColor = "deepskyblue";

  //Text properties for all markers
  private markerColor = 'black';
  private fontWeight = 'bold';
  private fontSize = '30px';
  private iconEmpty = ''//'../res/img/empty.png';


  // Injects the component class with imported services
  constructor(private geolocation: Geolocation, private mapService: MapService, private buildingFactory: BuildingFactoryService, private indoorPathingService: IndoorPathingService, private myService: ReadGridService) 
  {
    this.loyola = new Campus(new Location(45.458234, -73.640493, 0));
    this.sgw = new Campus(new Location(45.494711, -73.577871, 0));
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  // Initializes the map object with default values
  async initMap(){
    // Gets current position of user
    const resp = await this.geolocation.getCurrentPosition();

    this.userLocation.setLat(resp.coords.latitude);
    this.userLocation.setLng(resp.coords.longitude);

    this.mapOptions = {
      center: this.userLocation.getGoogleLatLng(),
      zoom: 17,
      disableDefaultUI: true,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    this.map = new google.maps.Map(this.googleMap.nativeElement, this.mapOptions);

    this.userMarker = new google.maps.Marker({
      position: this.userLocation.getGoogleLatLng(),
      map: this.map,
      title: 'Here'
    });

    this.initOverlays();
    this.setDirectionsMap();
  }

  //sets an instance of the map to a service which injects it to other components
  setDirectionsMap(){
    this.mapService.setMap(this.map);
  }

  // Gets the current location of user and focuses map to that point
  getCurrentLocation(){
    this.geolocation.getCurrentPosition().then((resp) => {
      this.userLocation.setLat(resp.coords.latitude);
      this.userLocation.setLng(resp.coords.longitude);
      this.focusMap(this.userLocation);
    }).catch((error) => {
      console.log('Error getting location', error);
    });

    return this.userLocation.getGoogleLatLng();
  }

  // Re-center the map based on location parameter
  focusMap(location) {
    this.map.setCenter(location.getGoogleLatLng());
    this.map.setZoom(17);
  }

  // Spawns the building overlays on top of the map
  initOverlays()
  {

    var infoWindow = new google.maps.InfoWindow(); //This will be used for all markers

    // Refactor later: should use userMarker instead of userLocationMarker but info window doesnt open
    var userLocationMarker = new google.maps.Marker({
      position: this.getCurrentLocation(),
      map: this.map
    });

    var userContent = "";

    // Declare all overlay points
    var visualArts = overlays.visualArts.overlayPoints;
    var sjwCampus = overlays.sjwCampus.overlayPoints
    var loyolaCampus = overlays.loyolaCampus.overlayPoints;
    var hall = overlays.hall.overlayPoints;
    var molson = overlays.molson.overlayPoints;
    var faubourg = overlays.faubourg.overlayPoints;
    var EV = overlays.EV.overlayPoints;
    var LB = overlays.LB.overlayPoints;
    var greyNuns = overlays.greyNuns.overlayPoints;
    var scienceComplex = overlays.scienceComplex.overlayPoints;
    var journalismBuilding = overlays.journalismBuilding.overlayPoints;
    var chapel = overlays.chapel.overlayPoints;
    var psyBuilding = overlays.psyBuilding.overlayPoints;
    var stingerDome = overlays.stingerDome.overlayPoints;
    var stingerStadium = overlays.stingerStadium.overlayPoints;
    var centralBuilding = overlays.centralBuilding.overlayPoints;
    var vanierLibrary = overlays.vanierLibrary.overlayPoints;
    var adminBuilding = overlays.adminBuilding.overlayPoints;
    var jesuitHall = overlays.jesuitHall.overlayPoints;
    var athleticCamp = overlays.athleticCamp.overlayPoints;
    var loyolaGym = overlays.loyolaGym.overlayPoints;
    var phyServiceBuilding = overlays.phyServiceBuilding.overlayPoints;
    var centerArts = overlays.centerArts.overlayPoints;
    var saintIgnatius = overlays.saintIgnatius.overlayPoints;
    var structuralCenter = overlays.structuralCenter.overlayPoints;
    var jesuitResidence = overlays.jesuitResidence.overlayPoints;
    var studentResidences = overlays.studentResidences.overlayPoints;
    var sjwPath = [visualArts, sjwCampus];

    //Type of polygon
    var campusType = "campus";
    var buildingType = "building";

    // Polygon for each campus
    var sjwP = this.createPolygon(sjwPath, campusType);
    var loyolaP = this.createPolygon(loyolaCampus, campusType);

    //Polygon for each building
    var hallP = this.createPolygon(hall, buildingType);
    var molsonP = this.createPolygon(molson, buildingType);
    var faubourgP = this.createPolygon(faubourg, buildingType);
    var EVP = this.createPolygon(EV, buildingType);
    var lbP = this.createPolygon(LB, buildingType);
    var visualArtsP = this.createPolygon(visualArts, buildingType);
    var greyNunsP = this.createPolygon(greyNuns, buildingType);
    var scienceComplexP = this.createPolygon(scienceComplex, buildingType);
    var journalismP = this.createPolygon(journalismBuilding, buildingType);
    var chapelP = this.createPolygon(chapel, buildingType);
    var stingerDomeP = this.createPolygon(stingerDome, buildingType);
    var stingerStadiumP = this.createPolygon(stingerStadium, buildingType);
    var centralBuildingP = this.createPolygon(centralBuilding, buildingType);
    var vanierLibraryP = this.createPolygon(vanierLibrary, buildingType);
    var psyP = this.createPolygon(psyBuilding, buildingType);
    var adminP = this.createPolygon(adminBuilding, buildingType);
    var jesuitP = this.createPolygon(jesuitHall, buildingType);
    var athleticCampP = this.createPolygon(athleticCamp, buildingType);
    var loyolaGymP = this.createPolygon(loyolaGym, buildingType);
    var phyServiceP = this.createPolygon(phyServiceBuilding, buildingType);
    var centerArtsP = this.createPolygon(centerArts, buildingType);
    var saintIgnatiusP = this.createPolygon(saintIgnatius, buildingType);
    var structuralCenterP = this.createPolygon(structuralCenter, buildingType);
    var jesuitResidenceP = this.createPolygon(jesuitResidence, buildingType);
    var studentResidencesP = this.createPolygon(studentResidences, buildingType);

    //Hall Building Marker and info window
    var hallCenter = {lat: 45.497092, lng: -73.578974};
    var hallMarker = this.createMarker(hallCenter, "HALL")

    var hallContent =
    "<ion-list> <h4 align='center'>Henry F. Hall Building </h4>" +
    "<div style='max-height:250px; overflow:scroll;overflow-x:hidden;overflow-y:scroll;'>" +
    "<ion-item><ion-text> <label ><b>Address:</b></label> 1455 Boulevard de Maisonneuve O, Montréal, QC H3G 1M8 </ion-text> </ion-item>"+
    
    "<ion-item><p><label style='margin-right:1.2em'><b>Departments: </b></label><br/><br/>" +
    "Geography, Planning and Environment <br/><br/>"+
    "Political Science, Sociology and Anthropology, Economics <br/><br/>"+
    "School of Irish Studies</p></ion-item>" +

    "<ion-item><p><label style='margin-right:3.2em'><b>Services: </b></label><br/><br/>" +
    "Welcome Crew Office<br/><br/>"+
    "DB Clarke Theatre<br/><br/>"+
    "Dean of Students<br/><br/>" +
    "Aboriginal Student Resource Centre<br/><br/>"+
    "Concordia Student Union<br/><br/>"+
    "IT Service Desk<br/><br/>"+
    "Security Office<br/><br/>" +
    "Student Success Centre<br/><br/>"+
    "Mail Services<br/><br/>"+
    "Archives<br/><br/>"+
    "Career and Planning Services<br/><br/>"+
    "Sexual Assault Ressource Centre (SARC)</p></ion-item>"+
  
    "</ion-list><br/>"+
    "<div align ='center'><img width='50%' src=assets/BuildingImages/HallBuilding.jpg></div></div>" +
    "<div align ='center'><ion-button id='hall'>Enter Building</ion-button></div>"

    google.maps.event.addListener(hallMarker, 'click', function() 
    {
      infoWindow.setContent(hallContent);

      infoWindow.open(this.map, hallMarker);
    });

  
    //EV Building Marker and info window
    var evCenter = {lat: 45.495470, lng: -73.577780};
    var EVMarker = this.createMarker(evCenter, "EV")

    var EVContent =
    "<ion-list><h4 align='center'>Engineering, Computer Science and Visual Arts Integrated Complex</h4>" +
      "<div style='max-height:250px; overflow:scroll;overflow-x:hidden;overflow-y:scroll;'>" +
      "<ion-item><ion-text><label><b>Address:</b> </label>1515 Saint-Catherine St W, Montreal, Quebec H3G 2W1</ion-text></ion-item>"+
      "<ion-item><p><label style='margin-right:1.2em'><b>Departments: </b></label><br/><br/>" +

      "Gina Cody School of Engineering and Computer Science<br/><br/>"+
      "Electrical and Computer Engineering<br/><br/>"+
      "Building, Civil and Environmental Engineering<br/><br/>" +
      "Computer Science and Software Engineering<br/><br/>"+
      "Mechanical, Industrial and Aerospace Engineering<br/><br/>"+
      "Design and Computation Arts<br/><br/>"+
      "Faculty of Fine Arts<br/><br/>"+
      "Recreation and Athletics<br/><br/>"+
      "Zero Energy Building Studies<br/><br/>"+
      "Centre for Pattern Recognition and Machine Intelligence<br/><br/>"+
      "Center for Composites</p>"+
      "</ion-item>"+
      
      "<ion-item><p><label style='margin-right:3.2em'><b>Services: </b></label><br/><br/>" +
      "LeGym<br/><br/>"+
      "FOFA Gallery</p>"+
      "</ion-item>"+
      "</ion-list><br/>"+
      "<div align ='center'><img width='45%' src=assets/BuildingImages/ev.jpg></div></div>" +
      "<div align ='center'><ion-button id='ev'>Enter Building</ion-button></div>"

    google.maps.event.addListener(EVMarker, 'click', function() 
    {
      infoWindow.setContent(EVContent);
      infoWindow.open(this.map, EVMarker);
    });
          
    //LB Building Marker and info window
    var lbCenter = {lat: 45.496708, lng: -73.577912};
    var LBMarker = this.createMarker(lbCenter, "LB")


    var LBContent =
    "<ion-list> <h4 align='center'>J.W. McConnel Building</h4>" +
    "<div style='max-height:250px; overflow:scroll;overflow-x:hidden;overflow-y:scroll;'>" +
    "<ion-item><ion-text><label><b>Address:</b></label> 1400 Maisonneuve Blvd W Montreal, QC H3G 1M8 </ion-text></ion-item>"+
    "<ion-item><p><label style='margin-right:1.5em'><b>Departments: </b></label><br/><br/>" +
    "English<br/><br/>"+
    "History<br/><br/>"+
    "Études françaises<br/><br/>" +
    "Mathematics and Statistics<br/><br/>"+
    "Education<br/><br/>"+
    "Centre for Interdisciplinary Studies in Society and Culture" +
    "Centre for the Study of Learning and Performance" +
    "</p></ion-item>"+
    
    "<ion-item><p><label style='margin-right:3.5em'><b>Services: </b></label><br/><br/>" +
    "R. Howard Webster Library<br/><br/>"+
    "Welcome Centre<br/><br/>"+
    "Leonard and Bina Ellen Art Gallery<br/><br/>" +
    "J.A. De Sève Cinema<br/><br/>"+
    "Birks Student Service Centre<br/><br/>"+
    "Campus Stores<br/><br/>"+
    "Instructional & Information Technology Services (IITS)<br/><br/>" +
    "4TH SPACE"+
    "</p></ion-item>"+
    "</ion-list><br/>"+
    "<div align ='center'><img width='70%' src=assets/BuildingImages/LB.jpg></div></div>" +
    "<div align ='center'><ion-button id='lb'>Enter Building</ion-button></div>";

    google.maps.event.addListener(LBMarker, 'click', function() 
    {
      infoWindow.setContent(LBContent);

      infoWindow.open(this.map, LBMarker);
    });

    var fgCenter = {lat: 45.494115, lng: -73.578223};
    var FGMarker = this.createMarker(fgCenter, "FG")


    var FGContent =
    "<ion-list> <h4 align='center'>Faubourg Building </h4>" +
    "<div style='max-height:250px; overflow:scroll;overflow-x:hidden;overflow-y:scroll;'>" +
    "<ion-item><ion-text><label><b>Address:</b></label>  1250 Guy St, Montreal, Quebec H3H 2L3</ion-text></ion-item>"+
    
    "<ion-item><p><label style='margin-right:1.5em'><b>Departments: </b></label> <br/><br/>" +
    "Education<br/><br/>"+
    "Classics, Modern Language & Linguistics<br/><br/>"+
    "Concordia Continuing Education<br/><br/>" +
    "Mel Hoppenheim School of Cinema<br/><br/>" +
    "Montreal Institute for Genocide and Human Rights Studies<br/><br/>" +
    "District 3 Innovation Center" +
    "</p></ion-item>"+
    
    "<ion-item><p><label style='margin-right:3.5em'><b>Services: </b></label> <br/><br/>" +  
    "Human Resources<br/><br/>"+
    "Office of the Registrar<br/><br/>"+
    "Examinations Office<br/><br/>"+
    "Senior non-credit program"+
    "</p></ion-item>"+
    "</ion-list><br/>"+
    "<div align ='center'><img width='60%' src=assets/BuildingImages/fb.jpg></div></div>" +
    "<div align ='center'><ion-button id='fg'>Enter Building</ion-button></div>";

    google.maps.event.addListener(FGMarker, 'click', function() 
    {
      infoWindow.setContent(FGContent);

      infoWindow.open(this.map, FGMarker);
    });

    var mbCenter = {lat: 45.495095, lng: -73.578854};
    var MBMarker = this.createMarker(mbCenter, "MB")

    var MBContent =
    "<ion-list> <h4 align='center'>John Molson Building</h4>" +
    "<div style='max-height:250px; overflow:scroll;overflow-x:hidden;overflow-y:scroll;'>" +
    "<ion-item><ion-text><label><b>Address: </b></label>1600 Boulevard de Maisonneuve O, Montréal, QC H3H 1J5</ion-text> </ion-item>"+

    "<ion-item><p><label style='margin-right:1.5em'><b>Departments: </b></label> <br/><br/>" +
    
    "Accoutancy<br/><br/>"+
    "Supply Chain & Business Technology Management<br/><br/>"+
    "Finance<br/><br/>" +
    "Management<br/><br/>" +
    "Executive MBA Program<br/><br/>" +
    "Music<br/><br/>" +
    "Theatre<br/><br/>" +
    "Contemporary Dance" +
    "</p></ion-item>"+
    
    "<ion-item><p><label style='margin-right:3.5em'><b>Services: </b></label> <br/><br/>" +
    
    "Career Management Services<br/><br/>"+
    "John Molson Executive Centre<br/><br/>"+
    "Office of the Registrar<br/><br/>"+
    "Performing Arts Facilities"+
    "</p></ion-item>"+
    "</ion-list><br/>"+
    "<div align ='center'><img width='50%' src=assets/BuildingImages/JMSB.jpg></div></div>" +
    "<div align ='center'><ion-button id='mb'>Enter Building</ion-button></div>"

    google.maps.event.addListener(MBMarker, 'click', function() 
    {
      infoWindow.setContent(MBContent);

      infoWindow.open(this.map, MBMarker);
    });

    var vaCenter = {lat: 45.495530, lng: -73.573845};
    var VAMarker = this.createMarker(vaCenter, "VA")

    var VAContent =
    "<ion-list> <h4 align='center'>Visual Arts Building</h4>" +
    "<div style='max-height:250px; overflow:scroll;overflow-x:hidden;overflow-y:scroll;'>" +
    "<ion-item><ion-text><label><b>Address: </b>1395 René-Lévesque Blvd W, Montreal, Quebec H3G 2M5</label></ion-text> </ion-item>"+

    "<ion-item><p><label style='margin-right:1.5em'><b>Departments: </b></label><br/><br/>" +
    "Studio Arts<br/><br/>"+
    "Art History<br/><br/>"+
    "Art Education<br/><br/>" +
    "Creative Arts Therapies" +
    "</p></ion-item>"+
    
    "<ion-item><p><label style='margin-right:3.5em'><b>Services: </b></label><br/><br/>" +
    "VAV Art Gallery<br/><br/>"+
    "Art Supply Store"+
    "</p></ion-item>"+
    "</ion-list><br/>"+
    "<div align ='center'><img width='75%' src=assets/BuildingImages/va.jpg></div></div>" +
    "<div align ='center'><ion-button id='va'>Enter Building</ion-button></div>";


    google.maps.event.addListener(VAMarker, 'click', function() 
    {
      infoWindow.setContent(VAContent);

      infoWindow.open(this.map, VAMarker);
    });

    var gnCenter = {lat: 45.493432, lng: -73.576705};
    var GNMarker = this.createMarker(gnCenter, "GN")

    var GNContent =
    "<ion-list> <h4 align='center'>Grey Nuns Building</h4>" +
    "<div style='max-height:250px; overflow:scroll;overflow-x:hidden;overflow-y:scroll;'>" +
    "<ion-item><ion-text><label><b>Address: </b></ion-label>1395 René-Lévesque Blvd W, Montreal, Quebec H3G 2M5</ion-text> </ion-item>"+
    
    "<ion-item><p><label style='margin-right:1.5em'><b>Services: </b></label><br/><br/>" +
    "Residences<br/><br/>"+
    "Grey Nuns Library<br/><br/>"+
    "Daycare Centre<br/><br/>"+
    "Summer Accommodation"+
    "</p></ion-item>"+
    "</ion-list><br/>"+
    "<div align ='center'><img width='55%' src=assets/BuildingImages/gn.jpg></div></div>" +
    "<div align ='center'><ion-button id='gn'>Enter Building</ion-button></p><div>";

    google.maps.event.addListener(GNMarker, 'click', function() 
    {
      infoWindow.setContent(GNContent);

      infoWindow.open(this.map, GNMarker);
    });

  
    //Loyola Campus
    var cjCenter = {lat: 45.457395, lng: -73.640399};
    var CJMarker = this.createMarker(cjCenter, "CJ")

    var CJContent =
    "<ion-list> <h4 align='center'>Communication Studies and Journalism Building</h4>" +
    "<div style='max-height:250px; overflow:scroll;overflow-x:hidden;overflow-y:scroll;'>" +
    "<ion-item><ion-text><label><b>Address: </b></label>7141 Sherbrooke St W, Montreal, Quebec H4B 1R6 </ion-text></ion-item>"+
    
    "<ion-item><p><label style='margin-right:1.5em'><b>Departments: </b></label> <br/><br/>" +
    "Communication Studies<br/><br/>"+
    "Journalism"+
    "</p></ion-item>"+

    "<ion-item><p><label style='margin-right:3.5em'><b>Services: </b></label> <br/><br/>" +
    "Campus Retail Stores"+
    "</p></ion-item>"+
    "</ion-list><br/>"+
    "<div align ='center'><img width='55%' src=assets/BuildingImages/cj.jpg></div></div>" +
    "<div align ='center'><ion-button id='cj'>Enter Building</ion-button></div>";

    google.maps.event.addListener(CJMarker, 'click', function() 
    {
      infoWindow.setContent(CJContent);

      infoWindow.open(this.map, CJMarker);
    });



    var scCenter = {lat: 45.457605, lng: -73.641512};
    var SCMarker = this.createMarker(scCenter, "SC");

    var SCContent =
    "<ion-list><h4 align='center'>Richard J. Renaud Science Complex</h4>" +
    "<div style='max-height:250px; overflow:scroll;overflow-x:hidden;overflow-y:scroll;'>" +
    "<ion-item><ion-text><label><b>Address: </b></label>3475 Rue West Broadway Montreal, QC H4B 2A7<ion-text></ion-item>"+
    
    "<ion-item><p><label style='margin-right:1.5em'><b>Departments: </b></label> <br/><br/>" +
    "Biology<br/><br/>"+
    "Chemistry and Biochemistry<br/><br/>"+
    "Health, Kinesiology & Applied Physiology<br/><br/>"+
    "Physics<br/><br/>"+
    "Psychology<br/><br/>"+
    "Centre for Biological Applications of Mass Spectrometry<br/><br/>"+
    "Centre for NanoScience Research<br/><br/>"+
    "Centre for Studies in Behavioral Neurobiology<br/><br/>"+
    "Centre for Research in Molecular Modeling"+
    "</p></ion-item>"+

    "<ion-item><p><label style='margin-right:3.5em'><b>Services: </b></label> <br/><br/>" +
    "Science College<br/><br/>"+
    "Science Technical Centre<br/><br/>"+
    "Animal Care Facilities<br/><br/>"+
    "Security Office<br/><br/>"+
    "Café"+
    "</p></ion-item>"+
    "</ion-list><br/>"+
    "<div align ='center'><img width='60%'  src=assets/BuildingImages/sc.jpg></div></div>" +
    "<div align = 'center'><ion-button id='sc'>Enter Building</ion-button></div>";

    google.maps.event.addListener(SCMarker, 'click', function() 
    {
      infoWindow.setContent(SCContent);

      infoWindow.open(this.map, SCMarker);
    });



    var ljCenter = {lat: 45.458514, lng: -73.641082};
    var LJMarker = this.createMarker(ljCenter, "LJ");

    var LJContent =
    "<ion-list><h4 align='center'>Loyola Jesuit Hall and Conference Centre</h4>" +
    "<div style='max-height:250px; overflow:scroll;overflow-x:hidden;overflow-y:scroll;'>" +
    "<ion-item><ion-text><label><b>Address: </b></label>7141 Sherbrooke St W, Montreal, Quebec H4B 1R6<ion-text> </ion-item>"+

    "<ion-item><p><label style='margin-right:1.5em'><b>Services: </b></label> <br/><br/>" +
    
    "Loyola Jesuit Hall and Conference Centre<br/><br/>"+
    "Conference services"+
    "</p></ion-item>"+
    "</ion-list><br/>"+
    "<div align ='center'><img width='50%'  src=assets/BuildingImages/lj.jpg></div></div>" +
    "<div align = 'center'><ion-button id='lj'>Enter Building</ion-button></div>";

    google.maps.event.addListener(LJMarker, 'click', function() 
    {
      infoWindow.setContent(LJContent);

      infoWindow.open(this.map, LJMarker);
    });


    var cbCenter = {lat: 45.458236, lng: -73.640345};
    var CBMarker = this.createMarker(cbCenter, "CB");

    var CBContent =
    "<ion-list><h4 align='center'>Central Building</h4>" +
    "<div style='max-height:250px; overflow:scroll;overflow-x:hidden;overflow-y:scroll;'>" +
    "<ion-item><ion-text><label><b>Address: </b></label>7141 Sherbrooke St W, Montreal, Quebec H4B 2B5</ion-text></ion-item>"+

    "<ion-item><p><label style='margin-right:1.5em'><b>Services: </b></label> <br/><br/>" +
    "Concordia Student Union<br/><br/>"+
    "Loyola College for Diversity and Sustainability and Loyola"+
    "</p></ion-item>"+
    "</ion-list><br/>"+
    "<div align ='center'><img width='50%'  src=assets/BuildingImages/cb.jpg></div></div>" +
    "<div align = 'center'><ion-button id='cb'>Enter Building</ion-button></div>";

    google.maps.event.addListener(CBMarker, 'click', function() 
    {
      infoWindow.setContent(CBContent);

      infoWindow.open(this.map, CBMarker);
    });

    var adCenter = {lat: 45.458070, lng: -73.639732};
    var ADMarker = this.createMarker(adCenter, "AD");

    var ADContent =
    "<ion-list> <h4 align='center'>Administration Building</h4>" +
    "<div style='max-height:250px; overflow:scroll;overflow-x:hidden;overflow-y:scroll;'>" +
    "<ion-item><ion-text><label><b>Address: </b></label>7141 Sherbrooke St W, Montreal, Quebec H4B 1R6</ion-text> </ion-item>"+
    
    "<ion-item><p><label style='margin-right:1.5em'><b>Departments: </b></label> <br/><br/>" +
    
    "Faculty of Arts & Science"+
    "</p></ion-item>"+

    "<ion-item><p><label style='margin-right:3.5em'><b>Services: </b></label> <br/><br/>" +
    
    "Welcome Crew Office<br/><br/>"+
    "Centre for Teaching & Learning<br/><br/>"+
    "Loyola International College<br/><br/>"+
    "Provost and VP, Academic<br/><br/>"+
    "Concordia Multi-Faith and Spirituality Centre<br/><br/>"+
    "Advocacy & Support Services<br/><br/>"+
    "Access Centre for Students with Disabilities<br/><br/>"+
    "Councelling and Development<br/><br/>"+
    "Health Services"+
    "</p></ion-item>"+
    "</ion-list><br/>"+

    "<div align ='center'><img width='55%' src=assets/BuildingImages/ad.jpg></div></div>" +
    "<div align ='center'><ion-button id='ad'>Enter Building</ion-button></div>";

    google.maps.event.addListener(ADMarker, 'click', function() 
    {
      infoWindow.setContent(ADContent);

      infoWindow.open(this.map, ADMarker);
    });


    var pyCenter = {lat: 45.458894, lng: -73.640568};
    var PYMarker = this.createMarker(pyCenter, "PY");

    var PYContent =
    "<ion-list> <h4 align='center'>Psychology Building</h4>" +
    "<div style='max-height:250px; overflow:scroll;overflow-x:hidden;overflow-y:scroll;'>" +
    "<ion-item><ion-text><label><b>Address: </b></label>7141 Sherbrooke St W, Montreal, Quebec H4B 2Z3</ion-text> </ion-item>"+
    
    "<ion-item><p><label style='margin-right:1.5em'><b>Departments: </b></label> <br/><br/>" +
    
    "Psychology<br/><br/>"+
    "Centre for clinical research in health (CCRH)"+
    "</p></ion-item></ion-list><br/>"+

    "<div align ='center'><img width='45%' src=assets/BuildingImages/py.jpg></div></div>" +
    "<div align ='center'><ion-button id='py'>Enter Building</ion-button></div>";

    google.maps.event.addListener(PYMarker, 'click', function() 
    {
      infoWindow.setContent(PYContent);

      infoWindow.open(this.map, PYMarker);
    });


    var vlCenter = {lat: 45.458932, lng: -73.638512};
    var VLMarker = this.createMarker(vlCenter, "VL");

    var VLContent =
    "<ion-list><h4 align='center'>Vanier Library</h4>" +
    "<div style='max-height:250px; overflow:scroll;overflow-x:hidden;overflow-y:scroll;'>" +
    "<ion-item><ion-text><label><b>Address: </b></label>7141 Sherbrooke St W, Montreal, Quebec H4B 1R6</ion-text> </ion-item>"+

    "<ion-item><p><label style='margin-right:1.5em'><b>Services: </b></label> <br/><br/>" +
    "Library"+
    "</p></ion-item>"+
    "</ion-list><br/>"+

    "<div align ='center'><img width='45%' src=assets/BuildingImages/vl.jpg></div></div>" +
    "<div align ='center'><ion-button id='vl'>Enter Building</ion-button></div>";

    google.maps.event.addListener(VLMarker, 'click', function() 
    {
      infoWindow.setContent(VLContent);

      infoWindow.open(this.map, VLMarker);
    });
           

    var csCenter = {lat: 45.458008, lng: -73.637248};
    var CSMarker = this.createMarker(csCenter, "CS");

    var CSContent =
    "<ion-list> <h4 align='center'>Concordia Stadium</h4>" +
    "<ion-item><ion-text><label><b>Address: </b></label>7141 Sherbrooke St W Montreal, Quebec H4B 1R2</ion-text> </ion-item></ion-list>"+

    "<div align ='center'><img width='45%' src=assets/BuildingImages/cs.jpg></div>"

    google.maps.event.addListener(CSMarker, 'click', function() 
    {
      infoWindow.setContent(CSContent);

      infoWindow.open(this.map, CSMarker);
    });

             
    var sdCenter = {lat: 45.457525, lng: -73.636085};
    var SDMarker = this.createMarker(sdCenter, "SD");

    var SDContent =
    "<ion-list> <h4 align='center'>Stinger Dome</ion-title></h4>" +
    "<ion-item><ion-text><label><b>Address: </b></label>7200 Sherbrooke St W Montreal, Quebec H4B 1R2</ion-text></ion-item></ion-list>"+

    "<div align ='center'><img width='45%' src=assets/BuildingImages/sd.jpg></div>"

    google.maps.event.addListener(SDMarker, 'click', function() 
    {
      infoWindow.setContent(SDContent);

      infoWindow.open(this.map, SDMarker);
    });

    
    var pcCenter = {lat: 45.456701, lng: -73.637558};
    var PCMarker = this.createMarker(pcCenter, "PC");

    var PCContent =
    "<ion-list><h4 align='center'>PERFORM Centre</ion-title></h4>" +
    "<ion-item><ion-text><label><b>Address: </b></label>7141 Sherbrooke St W, Montreal, Quebec H4B 1R6</ion-text> </ion-item>"+

    "<ion-item><p><label style='margin-right:1.5em'><b>Services: </b></label> <br/><br/>" +
    "PERFORM Centre"+
    "</p></ion-item>"+
    "</ion-list>"+

    "<div align ='center'><img width='55%' src=assets/BuildingImages/pc.jpg></div>"

    google.maps.event.addListener(PCMarker, 'click', function() 
    {
      infoWindow.setContent(PCContent);

      infoWindow.open(this.map, PCMarker);
    });


    var cgCenter = {lat: 45.456910, lng: -73.638250};
    var CGMarker = this.createMarker(cgCenter, "CG");

    var CGContent =
    "<ion-list> <h4 align='center'>Concordia Gymnasium</h4>" +
    "<ion-item><ion-text><label><b>Address: </b></label>7200 Sherbrooke St W Montreal, Quebec H4B 1R6 </ion-text></ion-item>"+

    "<ion-item><p><label style='margin-right:1.5em'><b>Services: </b></label> <br/><br/>" +
    "Gymnasium"+
    "</p></ion-item>"+
    "</ion-list>"+

    "<div align ='center'><img width='60%' src=assets/BuildingImages/cg.jpg></div>"

    google.maps.event.addListener(CGMarker, 'click', function() 
    {
      infoWindow.setContent(CGContent);

      infoWindow.open(this.map, CGMarker);
    });


    var psCenter = {lat: 45.459523, lng: -73.639727};
    var PSMarker = this.createMarker(psCenter, "PS");

    var PSContent =
    "<ion-list> <h4 align='center'>Physical Services Building</h4>" +
    "<div style='max-height:250px; overflow:scroll;overflow-x:hidden;overflow-y:scroll;'>" +
    "<ion-item><ion-text><label><b>Address: </b></label>7141 Sherbrooke St W, Montreal, Quebec H4B 1R6 </ion-text></ion-item>"+

    "<ion-item><p><label style='margin-right:1.5em'><b>Services: </b></label> <br/><br/>" +
    
    "Environmental Health and Safety<br/><br/>"+
    "Facilities Management"+
    "</p></ion-item>"+
    "</ion-list><br/></div>"+

    "<div align ='center'><ion-button id='ps'>Enter Building</ion-button></div>";

    google.maps.event.addListener(PSMarker, 'click', function() 
    {
      infoWindow.setContent(PSContent);

      infoWindow.open(this.map, PSMarker);
    });


    var tbCenter = {lat:45.459969, lng: -73.640887};
    var TBMarker = this.createMarker(tbCenter, "TB");

    var TBContent =
    "<ion-list><h4 align='center'>Terrebonne Building</h4>" +
    "<ion-item><ion-text><label><b>Address: </b></label>7079 Rue de Terrebonne, Montréal, QC H4B 2B4 </ion-text></ion-item> </ion-list><br/>"

    google.maps.event.addListener(TBMarker, 'click', function() 
    {
      infoWindow.setContent(TBContent);

      infoWindow.open(this.map, TBMarker);
    });


    var siCenter = {lat:45.457724, lng: -73.642326};
    var SIMarker = this.createMarker(siCenter, "SI");

    var SIContent =
    "<ion-list><h4 align='center'>Saint Ignatius of Loyola</h4>" +
    "<ion-item><ion-text><label><b>Address: </b></label>4455 Rue West Broadway, Montréal, QC H4B 2A7</ion-text> </ion-item></ion-list><br/>" +
    "<div align ='center'><img width='55%' src=assets/BuildingImages/si.png></div>"

    google.maps.event.addListener(SIMarker, 'click', function() 
    {
      infoWindow.setContent(SIContent);

      infoWindow.open(this.map, SIMarker);
    });


    var geCenter = {lat: 45.456857, lng: -73.640421};
    var GEMarker = this.createMarker(geCenter, "GE");

    var GEContent =
    "<ion-list><h4 align='center'>Centre for Structural and Functional Genomics</h4>" +
    "<div style='max-height:250px; overflow:scroll;overflow-x:hidden;overflow-y:scroll;'>" +
    "<ion-item><ion-text><label><b>Address: </b></label>7141 Sherbrooke St W, Montreal, Quebec H4B 1R6</ion-text> </ion-item>"+

    "<ion-item><p><label style='margin-right:1.5em'><b>Services: </b></label> <br/><br/>" +
    "Centre for Structural and Functional Genomics"+
    "</p></ion-item>"+
    "</ion-list><br/>"+

    "<div align ='center'><img width='45%' src=assets/BuildingImages/ge.jpg></div></div>" +
    "<div align ='center'><ion-button id='ge'>Enter Building</ion-button></div>";

    google.maps.event.addListener(GEMarker, 'click', function() 
    {
      infoWindow.setContent(GEContent);

      infoWindow.open(this.map, GEMarker);
    });

    
    var jrCenter = {lat: 45.458454, lng: -73.643229};
    var JRMarker = this.createMarker(jrCenter, "JR");

    var JRContent =
    "<ion-list><h4 align='center'>Jesuit Residence</h4>" +
    "<div style='max-height:250px; overflow:scroll;overflow-x:hidden;overflow-y:scroll;'>" +
    "<ion-item><ion-text><label><b>Address: </b></label>7141 Sherbrooke St W, Montreal, Quebec</ion-text> </ion-item>"+

    "<ion-item><p><label style='margin-right:1.5em'><b>Services: </b></label> <br/><br/>" +
    "Student Residence"+
    "</p></ion-item>"+
    "</ion-list><br/>"+

    "<div align ='center'><img width='45%' src=assets/BuildingImages/jr.jpg><div>" 

    google.maps.event.addListener(JRMarker, 'click', function() 
    {
      infoWindow.setContent(JRContent);

      infoWindow.open(this.map, JRMarker);
    });


    var srCenter = {lat: 45.459204, lng: -73.641761};
    var SRMarker = this.createMarker(srCenter, "SR");

    var SRContent =
    "<ion-list><h4 align='center'>Student Residence</h4>" +
    "<div style='max-height:250px; overflow:scroll;overflow-x:hidden;overflow-y:scroll;'>" +
    "<ion-item><ion-text><label><b>Address: </b></label>7079 Rue de Terrebonne, Montréal, QC H4B 2B4</ion-text> </ion-item>"+

    "<ion-item><p><label style='margin-right:1.5em'><b>Services: </b></label> <br/><br/>" +
    "Student Residence"+
    "</p></ion-item>"+
    "</ion-list><br/>"

    google.maps.event.addListener(SRMarker, 'click', function() 
    {
      infoWindow.setContent(SRContent);

      infoWindow.open(this.map, SRMarker);
    });

    
    var fcCenter = {lat: 45.458460, lng: -73.639219};
    var FCMarker = this.createMarker(fcCenter, "FC");

    var FCContent =
    "<ion-list><h4 align='center'>F.C. Smith Building</h4>" +
    "<div style='max-height:250px; overflow:scroll;overflow-x:hidden;overflow-y:scroll;'>" +
    "<ion-item><ion-text><label><b>Address: </b></label>7141 Sherbrooke St W, Montreal, Quebec H4B 1R6</ion-text> </ion-item>"+

    "<ion-item><p><label style='margin-right:1.5em'><b>Services: </b></label> <br/><br/>" +
    "F.C. Smith Auditorium<br/><br/>"+
    "Cazalet Theater<br/><br/>"+
    "Concordia Multi-Faith and Spirituality Centre"+
    "</p></ion-item>"+
    "</ion-list><br/>"+

    "<div align ='center'><img width='45%' src=assets/BuildingImages/fc.jpeg></div></div>" 
    "<div align ='center'><ion-button id='fc'>Enter Building</ion-button></div>";

    google.maps.event.addListener(FCMarker, 'click', function() 
    {
      infoWindow.setContent(FCContent);

      infoWindow.open(this.map, FCMarker);
    });

   

    //var hallTest = new google.maps.LatLng(45.497194, -73.578886) //Variable to test containsLocation
    
    //For current location
    var currentLoc = this.getCurrentLocation();
    var currentBuilding = ""; //For Content of user marker info window
    var currentCampus = "";

    //Listener to the user location marker
    userLocationMarker.addListener('click', function()
    {
      //Check if user location is inside a Concordia campus
      if(google.maps.geometry.poly.containsLocation(currentLoc, sjwP) == true)
      {
        currentCampus = "Sir George Williams Campus";
      }
      else if((google.maps.geometry.poly.containsLocation(currentLoc, loyolaP) == true))
      {
        currentCampus = "Loyola Campus";
      }
      else
      {
        currentCampus = "N/A";
      }    

      //Check if user location is inside a Concordia building
      if(google.maps.geometry.poly.containsLocation(currentLoc, hallP) == true)
      {
        currentBuilding = "Hall Building";
      }
      else if((google.maps.geometry.poly.containsLocation(currentLoc, molsonP) == true))
      {
        currentBuilding = "John Molson Building";
      }
      else if((google.maps.geometry.poly.containsLocation(currentLoc, EVP) == true))
      {
        currentBuilding = "Engineering, Computer Science and Visual Arts Integrated Complex";
      }
      else if((google.maps.geometry.poly.containsLocation(currentLoc, lbP) == true))
      {
        currentBuilding = "J.W. McConnel Building";
      }
      else if((google.maps.geometry.poly.containsLocation(currentLoc, visualArtsP) == true))
      {
        currentBuilding = "Visual Arts Building";
      }
      else if((google.maps.geometry.poly.containsLocation(currentLoc, faubourgP) == true))
      {
        currentBuilding = "Faubourg Building";
      }
      else if((google.maps.geometry.poly.containsLocation(currentLoc, greyNunsP) == true))
      {
        currentBuilding = "Grey Nuns Building";
      }
      else if((google.maps.geometry.poly.containsLocation(currentLoc, journalismP) == true))
      {
        currentBuilding = "Communication Studies and Journalism Building";
      }
      else if((google.maps.geometry.poly.containsLocation(currentLoc, scienceComplexP) == true))
      {
        currentBuilding = "Richard J. Renaud Science Complex";
      }
      
      else if((google.maps.geometry.poly.containsLocation(currentLoc, jesuitP) == true))
      {
        currentBuilding = "Loyola Jesuit Hall and Conference Centre";
      }
      else if((google.maps.geometry.poly.containsLocation(currentLoc, centralBuildingP) == true))
      {
        currentBuilding = "Central Building";
      }
      else if((google.maps.geometry.poly.containsLocation(currentLoc, adminP) == true))
      {
        currentBuilding = "Administration Building";
      }
      else if((google.maps.geometry.poly.containsLocation(currentLoc, psyP) == true))
      {
        currentBuilding = "Psychology Building";
      }
      else if((google.maps.geometry.poly.containsLocation(currentLoc, vanierLibraryP) == true))
      {
        currentBuilding = "Vanier Library";
      }
      else if((google.maps.geometry.poly.containsLocation(currentLoc, stingerStadiumP) == true))
      {
        currentBuilding = "Concordia Stadium";
      }

      else if((google.maps.geometry.poly.containsLocation(currentLoc, stingerDomeP) == true))
      {
        currentBuilding = "Stinger Dome";
      }
      else if((google.maps.geometry.poly.containsLocation(currentLoc, athleticCampP) == true))
      {
        currentBuilding = "PERFORM Centre";
      }
      else if((google.maps.geometry.poly.containsLocation(currentLoc, loyolaGymP) == true))
      {
        currentBuilding = "Concordia Gymnasium";
      }
      else if((google.maps.geometry.poly.containsLocation(currentLoc, phyServiceP) == true))
      {
        currentBuilding = "Physical Services Building<";
      }
      else if((google.maps.geometry.poly.containsLocation(currentLoc, centerArtsP) == true))
      {
        currentBuilding = "Terrebonne Building";
      }
      
      else if((google.maps.geometry.poly.containsLocation(currentLoc, saintIgnatiusP) == true))
      {
        currentBuilding = "Saint Ignatius of Loyola";
      }
      else if((google.maps.geometry.poly.containsLocation(currentLoc, structuralCenterP) == true))
      {
        currentBuilding = "Centre for Structural and Functional Genomics";
      }
      else if((google.maps.geometry.poly.containsLocation(currentLoc, jesuitResidenceP) == true))
      {
        currentBuilding = "Jesuit Residence";
      }
      else if((google.maps.geometry.poly.containsLocation(currentLoc, studentResidencesP) == true))
      {
        currentBuilding = "Student Residence";
      }
      else if((google.maps.geometry.poly.containsLocation(currentLoc, chapelP) == true))
      {
        currentBuilding = "F.C. Smith Building<";
      }
      else
      {
        currentBuilding = "N/A";
      }          

      userContent =
          "<ion-list><h4 align='center'>Concordia University</h4>" +
          "<ion-item><ion-text><label><b>Current Campus: </b></label>"+currentCampus+"</ion-text></ion-item>"+
          "<ion-item><ion-text><label><b>Current Building: </b></label>"+currentBuilding+"</ion-text></ion-item></ion-list><br/>"
      infoWindow.setContent(userContent);
      infoWindow.open(this.map, userLocationMarker);
    });


    //Listener for the "enter building" button of info window
    infoWindow.addListener('domready', () => {
      if(document.getElementById("hall"))
      {
        document.getElementById("hall").addEventListener("click", () => {
          infoWindow.close();
          this.enterBuilding("HB", hallP, hallMarker);
        });
      }
      
      else if(document.getElementById("ev"))
      {
        document.getElementById("ev").addEventListener("click", () =>
        {
          infoWindow.close();
          this.enterBuilding("ev", EVP, EVMarker);
        });
      }

      else if(document.getElementById("lb"))
      {
        document.getElementById("lb").addEventListener("click", () =>
        {
           this.enterBuilding("lb", lbP, LBMarker);
        });
      }     
      else if(document.getElementById("fg"))
      {
        document.getElementById("fg").addEventListener("click", () =>
        {
           this.enterBuilding("fg", faubourgP, FGMarker);
        });
      }
      else if(document.getElementById("mb"))
      {
        document.getElementById("mb").addEventListener("click", () =>
        {
           this.enterBuilding("mb", molsonP, MBMarker);
        });
      }     
      else if(document.getElementById("va"))
      {
        document.getElementById("va").addEventListener("click", () =>
        {
           this.enterBuilding("va", visualArtsP, VAMarker);
        });
      }
      else if(document.getElementById("gn"))
      {
        document.getElementById("gn").addEventListener("click", () =>
        {
           this.enterBuilding("gn", greyNunsP, GNMarker);
        });
      }     
      else if(document.getElementById("cj"))
      {
        document.getElementById("cj").addEventListener("click", () =>
        {
           this.enterBuilding("cj", journalismP, CJMarker);
        });
      }
      else if(document.getElementById("sc"))
      {
        document.getElementById("sc").addEventListener("click", () =>
        {
           this.enterBuilding("sc", scienceComplexP, SCMarker);
        });
      }     
      else if(document.getElementById("lj"))
      {
        document.getElementById("lj").addEventListener("click", () =>
        {
           this.enterBuilding("lj", jesuitP, LJMarker);
        });
      }
      else if(document.getElementById("cb"))
      {
        document.getElementById("cb").addEventListener("click", () =>
        {
           this.enterBuilding("cb", centralBuildingP, CBMarker);
        });
      }     
      else if(document.getElementById("ad"))
      {
        document.getElementById("ad").addEventListener("click", () =>
        {
           this.enterBuilding("ad", adminP, ADMarker);
        });
      }
      else if(document.getElementById("py"))
      {
        document.getElementById("py").addEventListener("click", () =>
        {
           this.enterBuilding("py", psyP, PYMarker);
        });
      }     
      else if(document.getElementById("vl"))
      {
        document.getElementById("vl").addEventListener("click", () =>
        {
           this.enterBuilding("vl", vanierLibraryP, VLMarker);
        });
      }
      else if(document.getElementById("ps"))
      {
        document.getElementById("ps").addEventListener("click", () =>
        {
           this.enterBuilding("ps", phyServiceP, PSMarker);
        });
      }     
      else if(document.getElementById("ge"))
      {
        document.getElementById("ge").addEventListener("click", () =>
        {
           this.enterBuilding("ge", structuralCenterP, GEMarker);
        });
      }
      else if(document.getElementById("fc"))
      {
        document.getElementById("fc").addEventListener("click", () =>
        {
           this.enterBuilding("fc", chapelP, FCMarker);
        });
      }     

    });

    //Closes info window when clicking somewhere else on map
    google.maps.event.addListener(this.map, 'click', function() {
      if (infoWindow) {
          infoWindow.close();
      }
  });
  
  }
  
  // FUNCTION USED AFTER USER CLICKS THE "Enter Building" button
  async enterBuilding(id: string, polygon: any, marker: any)
  {             
    polygon.setVisible(false);
    marker.setVisible(false);

    let b: Building = await this.buildingFactory.loadBuilding(id);
    let buildingInfo = b.getBuildingInfo();

    this.indoorView(buildingInfo, polygon, marker);  
         
    switch (id) 
    {
      //Hall Building
      case 'HB':
          console.log("In " + id + " building.");     


          break;
      //EV building
      case 'ev':
          console.log("In " + id + " building.");
          
          break;
      //Library Building
      case 'lb':
          console.log("In " + id + " building.");
          break;
      //Faubourg Building
      case 'fg':
          console.log("In " + id + " building.");
          break;
      //John Molson Building
      case 'mb':
          console.log("In " + id + " building.");
          break;
      //Visual Arts Building
      case 'va':
          console.log("In " + id + " building.");
          break;
      //Grey Nuns Building
      case 'gn':
          console.log("In " + id + " building.");
          break;
      //Communications & Journalism Building
      case 'cj':
          console.log("In " + id + " building.");
          break;
      //Renaud Science Complex
      case 'sc':
          console.log("In " + id + " building.");
          break;
      //Loyola Jesuit Hall and Conference Centre
      case 'lj':
          console.log("In " + id + " building.");
          break;
      //Central Building
      case 'cb':
          console.log("In " + id + " building.");
          break;
      //Administration Building
      case 'ad':
          console.log("In " + id + " building.");
          break;
      //Psychology Building
      case 'py':
          console.log("In " + id + " building.");
          break;
      //F.C. Smith Building/Loyola Chapel
      case 'fc':
        console.log("In " + id + " building.");
          break;
      //Vanier Library Building
      case 'vl':
          console.log("In " + id + " building.");
          break;
      //Physical Services Building
      case 'ps':
          console.log("In " + id + " building.");
          break;
      //Centre for Structural and Functional Genomics
      case 'ge':
        console.log("In " + id + " building.");
        break;
    }  

  }

  /**
   * This method is called when user presses "Enter building" button, and it shows a drop down menu and exit button
   * which allows the user to view different floors in the building.
   * @param buildingInfo is a dictionary that holds informations about the buildings
   * @param polygon is the building layer
   * @param marker is the building marker
   */
  indoorView(buildingInfo: any, polygon: any, marker: any): void
  {
    let floorImage = ""; //Holds the image path
    var indoorOverlay; //Layer on top of building
    let self = this;
    let empty = "";

    var imageBound = {
      north: buildingInfo["bound"].north, //Top
      south: buildingInfo["bound"].south, //Bottom
      east: buildingInfo["bound"].east, //Right
      west: buildingInfo["bound"].west //Left
    };

    indoorOverlay = new google.maps.GroundOverlay(
        floorImage, 
        imageBound);
        indoorOverlay.setMap(this.map);

    //Zoom in
    this.map.setCenter({lat: buildingInfo["Location"].lat, lng: buildingInfo["Location"].lng});

    // var mapCenter = this.map.getCenter();
    // console.log(mapCenter);
    // var location = new google.maps.LatLng(mapCenter .lat(), mapCenter .lng());
    // console.log(location);

    // bounds of the desired area
    // var allowedBounds = new google.maps.LatLngBounds(
    //   new google.maps.LatLng(buildingInfo["bound"].south, buildingInfo["bound"].west), 
    //   new google.maps.LatLng(buildingInfo["bound"].north, buildingInfo["bound"].east)
    // );


    this.map.setZoom(19);
    //No zoom or drag anymore
    this.map.setOptions({minZoom: 18});

    //Dropdown content
    var selectContent= ""; 
    for(let i = 1; i <= buildingInfo["totalFloors"].nFloors; i++)
    {
      selectContent += "<option value="+i+">"+i+"</option>";
    }

    var floorDropdown = 
    "<ion-label style='margin-right:1em'><b>Floor</b></ion-label>" +
    "<select id ='floors'>" + 
    selectContent +
    "</select>";

    // Create a div to hold the control for dropdown and Exit button
    var controlFloorDiv = document.createElement('div');
    var controlExitDiv = document.createElement('div');

    // Set CSS for the control border of Floor
    var controlFloorUI = document.createElement('div');
    controlFloorUI.style.backgroundColor = '#fff';
    controlFloorUI.style.border = '2px solid #fff';
    controlFloorUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';

    // Set CSS for the control interior of Floor
    var controlFloorText = document.createElement('div');
    controlFloorText.style.fontSize = '16px';
    controlFloorText.style.lineHeight = '38px';
    controlFloorText.style.paddingTop = '5px';
    controlFloorText.style.paddingLeft = '5px';
    controlFloorText.style.paddingRight = '5px';
    controlFloorText.innerHTML = floorDropdown;

    // Set CSS for the control border of Exit
    var controlExitUI = document.createElement('div');
    controlExitUI.style.marginBottom = '22px';

    // Set CSS for the control interior of Exit
    var controlExitText = document.createElement('div');
    var exitButton = '<ion-button>Exit Building</ion-button>'
    controlExitText.innerHTML = exitButton;

    //Add child div inside parent div
    controlFloorDiv.appendChild(controlFloorUI);
    controlFloorUI.appendChild(controlFloorText);

    controlExitDiv.appendChild(controlExitUI);
    controlExitUI.appendChild(controlExitText);

    //Push the div into the map
    this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(controlFloorDiv);
    this.map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(controlExitDiv);

    //Listener for dropdown
    google.maps.event.addDomListener(document.getElementById('floors'), 'change', function(e) 
    {    
      for(let i = 0; i <buildingInfo["totalFloors"].nFloors; i++)
      {
        if(buildingInfo["Floors"][i] != undefined)
        {
          if(this.value == buildingInfo["Floors"][i].level)
          {
            floorImage = buildingInfo["Floors"][i].img;
            indoorOverlay.setMap(null);  
            indoorOverlay = new google.maps.GroundOverlay(
                floorImage, 
                imageBound);
            indoorOverlay.setMap(self.map);
            break;
          }
          else
          { 
            continue;
          }
        }
        //If no image found, then there is no layer
        indoorOverlay.setMap(null);
      }
    });

    //Listener for Exit button
    controlExitUI.addEventListener('click', function() 
    {
      indoorOverlay.setMap(null);  
      polygon.setVisible(true);
      marker.setVisible(true);
      controlExitText.innerHTML = empty;
      controlFloorText.innerHTML = empty;
      self.map.setOptions({minZoom: null});
      self.map.setZoom(18);
    });
      
  }

  createPolygon(path: any, type: string): any
  {
    var polygon;
    if(type == "building")
    {
      //Polygon for each building
      polygon = new google.maps.Polygon({
        paths: path,
        fillColor: this.fColor,
      });
      polygon.setMap(this.map);
    }
    else if (type == "campus")
    {
      polygon = new google.maps.Polygon({
        paths: path,
        visible: false
      });
    }
    polygon.setMap(this.map);

    return polygon;
  }

  createMarker(location: any, text: string): any
  {
    var marker = new google.maps.Marker
    ({
      position: location,
      map: this.map,
      icon: this.iconEmpty,
      label: 
      {
          color: this.markerColor,
          fontWeight: this.fontWeight,
          text: text,
          fontSize: this.fontSize,
      },
    });

    return marker;
    
  }
    
  










  /**
   * Takes as parameter a list of Locations and draws a path on the map using Google Maps API's Polyline object.
   * @param locationList 
   */
  drawPath(locationList: Location[])
  {
    //debugger;
    var pathCoordinates = [];
    
    locationList.forEach((location: Location) => {
      pathCoordinates.push({lat: location.getLat(), lng: location.getLng()});
    });

    var path = new google.maps.Polyline({
      path: pathCoordinates,
      geodesic: true,
      strokeColor: '#0000FF',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    const startMarker = new google.maps.Marker({
      position: locationList[0].getGoogleLatLng(),
      map: this.map,
      title: 'Here',
      label:'S'
    });

    const endMarker = new google.maps.Marker({
      position: locationList[locationList.length - 1].getGoogleLatLng(),
      map: this.map,
      title: 'Here',
      label: 'E'
    });

    path.setMap(this.map);
  }

}
