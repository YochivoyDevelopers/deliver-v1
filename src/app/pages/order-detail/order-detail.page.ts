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

  

  // Método para cargar el mapa una vez obtenidas las coordenadas
  loadMap() {
    let mapEle: HTMLElement = document.getElementById('map');
    let myLatLng = { lat: this.latC, lng: this.lngC };

    this.map = new google.maps.Map(mapEle, {
      center: myLatLng,
      zoom: 12
    });

    new google.maps.Marker({
      position: myLatLng,
      map: this.map,
      title: 'Ubicación Geocodificada'
    });

    google.maps.event.addListenerOnce(this.map, 'idle', () => {
      mapEle.classList.add('show-map');
    });
  }


  ngOnInit() {
    this.route.queryParams.subscribe(data => {
      console.log(data);
      this.tab_id = data.id;
      this.id = data.id;
      this.getOrder();
    });
  }

  

  @HostListener('copy', ['$event']) blockCopy(e: KeyboardEvent) {
    e.preventDefault();
  }


  getOrder() {
    // this.util.show();
    this.api.getOrderById(this.id).then((data) => {
      // this.util.hide();
      this.loaded = true;
      console.log('Respuesta de la API: ', data);
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
        
        console.log('Dirección:', this.deliveryAddress);
        if (this.latC === undefined || this.lngC === undefined) {
          console.log('Latitud o longitud de cliente no definida. Iniciando geocodificación...');
          this.geocodeAddress(this.deliveryAddress);
        } else {
          console.log('Latitud y longitud de cliente ya definidas:', this.latC, this.lngC);
        }
        
        this.api.getProfile(data.vid.uid).then((dataU) => {
          console.log('driver status cahcnage----->', dataU);
          this.tokenV = dataU.fcm_token;
        }).catch(error => {
          console.log(error);
        });
        console.log('this', this.orders);
      }
    }, error => {
      console.log('error in orders', error);
      // this.util.hide();
      this.loaded = true;
      this.util.errorToast(this.util.translate('Something went wrong'));
    }).catch(error => {
      console.log('error in order', error);
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

        // Imprimir las coordenadas en la consola
        console.log('Latitud:', this.latC);
        console.log('Longitud:', this.lngC);
      } else {
        console.error('Geocoding failed: ' + status);
      }
    });
  
  }


  changeStatus(value) {
    this.util.show();
    this.api.updateOrderStatus(this.id, value).then((data) => {

      console.log('data', data);
      const msg = this.util.translate('Your Order is ') + this.util.translate(value) + this.util.translate(' By ') + this.restName;
      if (value === 'delivered' || value === 'canceled') {
        const parm = {
          current: 'active',
        };
        this.api.updateProfile(localStorage.getItem('uid'), parm).then((data) => {
          console.log('driver status cahcnage----->', data);
        }).catch(error => {
          console.log(error);
        });
        this.api.sendNotification(msg, 'Orden ' + this.util.translate(value), this.tokenV).subscribe((data) => {
          console.log(data);
          this.util.hide();
        }, error => {
          this.util.hide();
          console.log('err', error);
        });
      }
      this.api.sendNotification(msg, 'Orden ' + this.util.translate(value), this.token).subscribe((data) => {
        console.log(data);
        this.util.hide();
      }, error => {
        this.util.hide();
        console.log('err', error);
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
      console.log(error);
      this.util.hide();
      this.navCtrl.navigateRoot(['/tabs/tab1']);
      this.util.errorToast(this.util.translate('Something went wrong'));
    });
  }

  changeOrderStatus() {
    console.log('order status', this.changeStatusOrder);
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
      console.log(data);
      this.util.hide();
      const msg = this.myname + this.util.translate(' Picked up your order');
      this.api.sendNotification(msg, this.util.translate('Order Picked'), this.token).subscribe(data => {
        console.log(data);
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
      console.log('error', error);
    }).catch(error => {
      console.log(error);
      this.util.hide();
    });
  }

  getCurrency() {
    return this.util.getCurrecySymbol();
  }

  delivered() {
    this.util.show();
    this.api.updateOrderStatus(this.id, 'delivered').then((data) => {
      console.log(data);
      this.util.hide();
      const msg = this.myname + this.util.translate(' Delivered your order');
      const parm = {
        current: 'active',
      };
      this.api.updateProfile(localStorage.getItem('uid'), parm).then((data) => {
        console.log('driver status cahcnage----->', data);
      }).catch(error => {
        console.log(error);
      });
      this.api.sendNotification(msg, this.util.translate('Order delivered'), this.token).subscribe(data => {
        console.log(data);
      });
      this.navCtrl.back();
    }, error => {
      this.util.hide();
      console.log('error', error);
      this.util.errorToast(this.util.translate('Something went wrong'));
    }).catch(error => {
      console.log(error);
      this.util.hide();
      this.util.errorToast(this.util.translate('Something went wrong'));
    });
  }

  open_map_vanue(lat, lng, type) {
    this.typeAddress = type;
    this.showMap = true;
    this.userCircle = null;
  
    
    console.log('Abriendo el mapa para la dirección:', type);
  
    // Observa la posición del usuario
    this.geolocation.watchPosition().subscribe((resp) => {
      const { latitude, longitude, accuracy } = resp.coords;
      const myLatLng = { lat: latitude, lng: longitude };
  
      console.log('Ubicación Actual Latitude:', latitude);
      console.log('Ubicación Actual Longitude:', longitude);
      console.log('Precisión de la ubicación:', accuracy);
  
      // Inicializa el mapa solo la primera vez
      if (!this.map) {
        console.log('Inicializando el mapa...');
        this.initMap(myLatLng);
        
        console.log('Mapa inicializado con éxito.');
      } else {
        console.log('El mapa ya está inicializado, no se volverá a centrar.');
      }
  
      // Actualiza o crea el círculo que representa la ubicación del usuario
      this.updateUserCircle(latitude, longitude, accuracy);
  
    
      // Solicita la ruta si ya se ha inicializado el mapa
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
      console.log('El mapa está listo y se ha mostrado en la interfaz.');
    });
  
    this.isMapInitialized = true;

    // Agrega los marcadores solo una vez
    this.addMarker(this.latV, this.lngV); // Marcador del restaurante
    this.addMarker(this.latC, this.lngC); // Marcador de la dirección de entrega
  }
  
  // Función para actualizar el círculo del usuario
  updateUserCircle(latitude, longitude, accuracy) {0
    console.log('Actualizando el círculo del usuario...');

    if (this.userCircle) {
      console.log('Actualizando el centro y radio del círculo existente.');
      this.userCircle.setCenter(new google.maps.LatLng(latitude, longitude));
      this.userCircle.setRadius(5); // Actualiza el radio con la precisión
    } else {
      console.log('Creando un nuevo círculo para la ubicación del usuario.');
      this.userCircle = new google.maps.Circle({
        center: new google.maps.LatLng(latitude, longitude),
        radius: 5, // Usa la precisión del GPS
        fillColor: '#4285F4',
        fillOpacity: 0.6,
        strokeColor: '#4285F4',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        map: this.map,
      });
    }

    if(this.isMapInitialized){
      console.log('El mapa esta inicializado, no se centrara de nuevo.');
      return;
    }

    this.isMapInitialized = true;
  }
  
  // Función para solicitar direcciones
  requestDirections(latitude, longitude) {
    console.log('Solicitando direcciones desde:', latitude, longitude);
    if (this.map) {

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
          console.log('Direcciones recibidas con éxito.');
          this.directionsDisplay.setDirections(response);
          // Desactivar ajuste automático del zoom
        this.directionsDisplay.setOptions({ preserveViewport: true });
        } else {
          
          
          console.error('Error en la solicitud de direcciones:', status);
          alert('No se pudieron mostrar las direcciones debido a: ' + status);
        }
      });
    } else {
      console.warn('El mapa no está inicializado, no se pueden solicitar direcciones.');
    }
  }
  
  // Función para agregar un marcador y devolverlo
  addMarker(lat, lng) {
    console.log('Agregando marcador en:', lat, lng);
    let marker = new google.maps.Marker({
      position: { lat, lng },
      map: this.map,
    });
    return marker;
  }
  
  // Función para limpiar los marcadores en el mapa
  clearMarkers() {
    console.log('Limpiando marcadores del mapa.');
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];
  }
  
  // Función para ir a Google Maps
  goMaps() {
    if (this.typeAddress == 1) {
      console.log('Redirigiendo a Google Maps para la dirección del restaurante.');
      window.location.href = "https://www.google.com/maps/search/?api=1&query=" + this.latV + "," + this.lngV;
    }
    if (this.typeAddress == 2) {
      console.log('Redirigiendo a Google Maps para la dirección de entrega.');
      window.location.href = "https://www.google.com/maps/search/?api=1&query=" + this.latC + "," + this.lngC;
    }
  }
  
  

}