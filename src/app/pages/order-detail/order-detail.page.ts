import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import { NavController } from '@ionic/angular';
import Swal from 'sweetalert2';
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { $ } from 'protractor';
declare var google;
@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.page.html',
  styleUrls: ['./order-detail.page.scss'],
})

export class OrderDetailPage implements OnInit {

  tab_id;
  id: any;
  grandTotal: any;
  orders: any = [];
  serviceTax: any;
  deliveryCharge: any;
  status: any;
  time: any;
  total: any;
  uid: any;
  address: any;
  address_details: any;
  restName: any;
  deliveryAddress: any;
  username: any;
  useremail: any;
  userphone: any;
  usercover: any;
  payment: any;
  myname: any;
  token: any;
  tokenV: any;
  latV: any;
  lngV: any;
  latC: any;
  lngC: any;
  changeStatusOrder: any;
  loaded: boolean;
  map: any;
  directionsService: any = null;
  directionsDisplay: any = null;
  bounds: any = null;
  myLatLng: any;
  waypoints: any;
  showMap: any = false;
  typeAddress: any = 1;
  userMarker: any;
  markers: any;
  geocoder: any;
  userCircle: any;
  isMapInitialized: boolean;
  isRouteInitialized: boolean = false;
  restaurantMarker:any;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router,
    private util: UtilService,
    private geolocation: Geolocation,
    private navCtrl: NavController) {
    this.loaded = false;
    this.directionsService = new google.maps.DirectionsService();
    this.directionsDisplay = new google.maps.DirectionsRenderer();
    this.bounds = new google.maps.LatLngBounds();
  }

  ngOnInit() {
    this.route.queryParams.subscribe(data => {
      this.tab_id = data.id;
      this.id = data.id;
      this.getOrder();
    });
  }


  @HostListener('copy', ['$event']) blockCopy(e: KeyboardEvent) {
    e.preventDefault();
  }


  getOrder() {
    
    this.api.getOrderById(this.id).then((data) => {
     
      this.loaded = true;
      
      if (data) {
        this.grandTotal = data.grandTotal;
        this.orders = JSON.parse(data.order);
        this.serviceTax = data.serviceTax;
        this.deliveryCharge = data.deliveryCharge;
        this.status = data.status;
        this.time = data.time;
        this.total = data.total;
        this.address = data.vid.address;
        this.restName = data.vid.name;
        this.address_details = data.vid.address_details;
        this.deliveryAddress = data.address.address;
        this.latV = data.vid.lat;
        this.lngV =data.vid.lng;
        this.latC = data.address.lat;
        this.lngC = data.address.lng;
        this.username = data.uid.fullname;
        this.useremail = data.uid.email;
        this.userphone = data.uid.phone;
        this.usercover = data.uid && data.uid.cover ? data.uid.cover : 'assets/imgs/user.jpg';;
        this.payment = data.paid;
        this.myname = data.dId.fullname;
        this.token = data.uid.fcm_token;

        this.open_map_vanue(2);
        
        if (this.latC === undefined || this.lngC === undefined) {
         // console.log('Latitud o longitud de cliente no definida. Iniciando geocodificación...');
          this.geocodeAddress(this.deliveryAddress);
        } else {
        //  console.log('Latitud y longitud de cliente ya definidas:', this.latC, this.lngC);
        }
        
        this.api.getProfile(data.vid.uid).then((dataU) => {
          //console.log('driver status cahcnage----->', dataU);
          this.tokenV = dataU.fcm_token;
        }).catch(error => {
         // console.log(error);
        });
      }
    }, error => {
      //console.log('error in orders', error);
      // this.util.hide();
      this.loaded = true;
      this.util.errorToast(this.util.translate('Something went wrong'));
    }).catch(error => {
     // console.log('error in order', error);
      // this.util.hide();
      this.loaded = true;
      this.util.errorToast(this.util.translate('Something went wrong'));
    });
  }

  geocodeAddress(deliveryAddress: String) {
    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ address: deliveryAddress }, (results, status) => {
      if (status === 'OK') {
        // Guardar las coordenadas
        this.latC = results[0].geometry.location.lat();
        this.lngC = results[0].geometry.location.lng();

      } else {
        console.error('Geocoding failed: ' + status);
      }
    });
  
  }


  changeStatus(value) {
    this.util.show();
    this.api.updateOrderStatus(this.id, value).then((data) => {

  
      const msg = this.util.translate('Your Order is ') + this.util.translate(value) + this.util.translate(' By ') + this.restName;
      if (value === 'delivered' || value === 'canceled' || value === 'ongoing' || value === 'torestaurant' || value === 'todestiny') {
        const parm = {
          current: 'active',
        };
        this.api.updateProfile(localStorage.getItem('uid'), parm).then((data) => {
        //  console.log('driver status cahcnage----->', data);
        }).catch(error => {
        //  console.log(error);
        });
        this.api.sendNotification(msg, 'Orden ' + this.util.translate(value), this.tokenV).subscribe((data) => {
        //  console.log(data);
          this.util.hide();
        }, error => {
          this.util.hide();
        //  console.log('err', error);
        });
      }
      this.api.sendNotification(msg, 'Orden ' + this.util.translate(value), this.token).subscribe((data) => {
      //  console.log(data);
        this.util.hide();
      }, error => {
        this.util.hide();
       // console.log('err', error);
      });
      this.util.publishNewAddress('hello');
      Swal.fire({
        title: this.util.translate('success'),
        text: this.util.translate('Order status changed to ') + this.util.translate(value),
        icon: 'success',
        timer: 2000,
        backdrop: false,
        background: 'white'
      });
      this.navCtrl.navigateRoot(['/tabs/tab1']);
    }).catch(error => {
    //  console.log(error);
      this.util.hide();
      this.navCtrl.navigateRoot(['/tabs/tab1']);
      this.util.errorToast("aaa"+this.util.translate('Something went wrong'));
    });
  }

  changeOrderStatus() {
   // console.log('order status', this.changeStatusOrder);
    if (this.changeStatusOrder) {
      this.changeStatus(this.changeStatusOrder);
    }
  }

  goToTracker() {
    const navData: NavigationExtras = {
      queryParams: {
        id: this.id
      }
    };
    this.router.navigate(['/tracker'], navData);
  }
  call() {
    window.open('https://api.whatsapp.com/send?phone=91' + this.userphone);
  }
  mail() {
    window.open('mailto:' + this.useremail);
  }

  back() {
    this.util.publishNewAddress('hello');
    this.navCtrl.back();
  }
  picked() {
    this.util.show();
    this.api.updateOrderStatus(this.id, 'ongoing').then((data) => {
   
      this.util.hide();
      const msg = this.myname + this.util.translate(' Picked up your order');
      this.api.sendNotification(msg, this.util.translate('Order Picked'), this.token).subscribe(data => {
     
      });
      this.navCtrl.back();
      this.util.publishNewAddress('hello');
      Swal.fire({
        title: 'success',
        text: this.util.translate('Order status changed to ') + 'ongoing',
        icon: 'success',
        timer: 2000,
        backdrop: false,
        background: 'white'
      });
      this.navCtrl.back();
    }, error => {
      this.util.hide();
    }).catch(error => {
      this.util.hide();
    });
  }

  getCurrency() {
    return this.util.getCurrecySymbol();
  }

  delivered() {
    this.util.show();
    this.api.updateOrderStatus(this.id, 'delivered').then((data) => {
   //   console.log(data);
      this.util.hide();
      const msg = this.myname + this.util.translate(' Delivered your order');
      const parm = {
        current: 'active',
      };
      this.api.updateProfile(localStorage.getItem('uid'), parm).then((data) => {
    //    console.log('driver status cahcnage----->', data);
      }).catch(error => {
 //       console.log(error);
      });
      this.api.sendNotification(msg, this.util.translate('Order delivered'), this.token).subscribe(data => {
    //    console.log(data);
      });
      this.navCtrl.back();
    }, error => {
      this.util.hide();
   //   console.log('error', error);
      this.util.errorToast(this.util.translate('Something went wrong'));
    }).catch(error => {
    //  console.log(error);
      this.util.hide();
      this.util.errorToast(this.util.translate('Something went wrong'));
    });
  }

  
  open_map_vanue(type) {
    this.typeAddress = type;
    this.showMap = true;
    this.userCircle = null;

    this.geolocation.watchPosition().subscribe((resp) => {
      const { latitude, longitude, accuracy } = resp.coords;
      const myLatLng = { lat: latitude, lng: longitude };
      if (!this.map) {
        this.initMap(myLatLng);
      } else {
        console.log('El mapa ya está inicializado, no se volverá a centrar.');
      }
      this.updateUserCircle(latitude, longitude, accuracy);
      this.requestDirections(latitude, longitude);    
    });
  }

  
  // Función para inicializar el mapa
  initMap(myLatLng) {
    let mapEle = document.getElementById('map');
    let panelEle = document.getElementById('panel');
  
    this.map = new google.maps.Map(mapEle, {
      center: myLatLng, // Centro inicial del mapa
      zoom: 12,
    });
    this.directionsDisplay.setMap(this.map);
    this.directionsDisplay.setPanel(panelEle);
  
    google.maps.event.addListenerOnce(this.map, 'idle', () => {
      mapEle.classList.add('show-map'); 
    });
    
  const centerControlDiv = document.createElement('div');
  this.createCenterControl(centerControlDiv, this.map);

  this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);
    this.isMapInitialized = true;
  }

  //Funcion para crear el boton de centrar ubicacion
  createCenterControl(controlDiv, map){
    // Estilo del botón
    const controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginTop = '10px';
    controlUI.style.marginBottom = '10px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Haz clic para centrar en tu ubicación';
    controlDiv.appendChild(controlUI);

    // Texto del botón
    const controlText = document.createElement('div');
    controlText.style.color = 'rgb(25,25,25)';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '16px';
    controlText.style.lineHeight = '38px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = 'Centrar en mi ubicación';
    controlUI.appendChild(controlText);

    // Evento para centrar el mapa cuando se hace clic en el botón
    controlUI.addEventListener('click', () => {
  //    console.log('Centrando el mapa en la ubicación del usuario...');
      if (this.userCircle) {
        const userLocation = this.userCircle.getCenter();
        map.panTo(userLocation); // Centrar el mapa en la ubicación del usuario
      } else {
        console.warn('No se encontró la ubicación del usuario para centrar el mapa.');
      }
    });
  }
  
  // Función para actualizar el círculo del usuario
  updateUserCircle(latitude, longitude, accuracy) {
    if (this.userCircle) {
      this.userCircle.setCenter(new google.maps.LatLng(latitude, longitude));
      this.userCircle.setRadius(5);
    } else {
      this.userCircle = new google.maps.Circle({
        center: new google.maps.LatLng(latitude, longitude),
        radius: 5, 
        fillColor: '#4285F4',
        fillOpacity: 0.6,
        strokeColor: '#4285F4',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        map: this.map,
      });
    }
    if(this.isMapInitialized){
      return;
    }
    this.isMapInitialized = true;

  }

  requestDirections(latitude, longitude) {
    if (this.map) {
      if(this.status === "todestiny"){
        const origin = new google.maps.LatLng(latitude, longitude);
        const destination = new google.maps.LatLng(this.latC, this.lngC);
      
        this.directionsService.route({
        origin: origin,
        destination: destination,
       
        travelMode: google.maps.TravelMode.DRIVING,
        avoidTolls: true,
      }, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
        this.directionsDisplay.setDirections(response);
        if (!this.isRouteInitialized) {
          this.map.fitBounds(response.routes[0].bounds);
          this.isRouteInitialized = true; 
        }  
        this.directionsDisplay.setOptions({ preserveViewport: true });
        } else {
          console.error('Error en la solicitud de direcciones:', status);
          alert('Recalculando ');
        }
      });
      } else {
        const origin = new google.maps.LatLng(latitude, longitude);
      const destination = new google.maps.LatLng(this.latC, this.lngC);
      const waypoint = new google.maps.LatLng(this.latV, this.lngV);

      this.directionsService.route({
        origin: origin,
        destination: destination,
        waypoints: [{location: waypoint, stopover:true }],
        travelMode: google.maps.TravelMode.DRIVING,
        avoidTolls: true,
      }, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
        this.directionsDisplay.setDirections(response);
        if (!this.isRouteInitialized) {
          this.map.fitBounds(response.routes[0].bounds);
          this.isRouteInitialized = true; 
        }  
        this.directionsDisplay.setOptions({ preserveViewport: true });
        } else {
          console.error('Error en la solicitud de direcciones:', status);
          alert('Recalculando ');
        }
      });
      }
      
    } else {
      console.warn('El mapa no está inicializado, no se pueden solicitar direcciones.');
    }
  }

  // Función para ir a Google Maps
goMaps() {
    if (this.typeAddress == 1) {
      
      window.location.href = "https://www.google.com/maps/search/?api=1&query=" + this.latV + "," + this.lngV;
    }
    if (this.typeAddress == 2) {
     
      window.location.href = "https://www.google.com/maps/search/?api=1&query=" + this.latC + "," + this.lngC;
    }
  }

  

}