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

  geocoder: any;

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
        this.geocodeAddress(this.deliveryAddress);
        console.log('Restaurante Latitude:', this.latV);
        console.log('Restaurante Longitude:', this.lngV);

        
        
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
    this.typeAddress =type
    this.showMap = true;
    
    this.geolocation
      .getCurrentPosition()
      .then(resp => {
        let latitude = resp.coords.latitude;
        let longitude = resp.coords.longitude;

        console.log('Ubicacion Real Latitude:', latitude);
        console.log('Ubicacion Real Longitude:', longitude);
       
        let mapEle: HTMLElement = document.getElementById('map');
        let panelEle: HTMLElement = document.getElementById('panel');
        let myLatLng = { lat: latitude, lng: longitude };
        let myLatLng2 = {lat: this.latC, lng: this.latC};
        let myLatLng3 = {lat: this.latV, lng: this.lngV};
        // create map

        this.waypoints = [
          {
            location: new google.maps.LatLng(latitude, longitude),
            stopover: true,
          },
          {
            location: new google.maps.LatLng(this.latV, this.lngV),
            stopover: true,
            
          },
          {
            location: new google.maps.LatLng(this.latC, this.lngC),
            stopover: true,
          }
          
        ];


        this.map = new google.maps.Map(mapEle, {
          center: myLatLng,
          zoom: 12
        });
        this.directionsDisplay.setMap(this.map);
        this.directionsDisplay.setPanel(panelEle);


        google.maps.event.addListenerOnce(this.map, 'idle', () => {
         
          mapEle.classList.add('show-map');
          //this.calculateRoute();
         
        /*  this.waypoints.forEach(waypoint => {
            var point = new google.maps.LatLng(waypoint.location.lat, waypoint.location.lng);
            this.bounds.extend(point);
          });
          
          this.map.fitBounds(this.bounds);*/

          this.waypoints.forEach((waypoint, index) => {
            
          
            new google.maps.Marker({
              position: waypoint.location,
              map: this.map,
              // Marcador personalizado
              label: {
                text: (index + 1).toString(), // Número del waypoint
                color: 'white', // Color del texto
                fontSize: '16px', // Tamaño de la fuente
              },
            });
          });

          
          
          this.directionsService.route({
            origin: new google.maps.LatLng(latitude, longitude),
            destination: new google.maps.LatLng(this.latC, this.lngC),
            waypoints: this.waypoints,


            travelMode: google.maps.TravelMode.DRIVING,
            avoidTolls: true
          }, (response, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
              console.log(response);
              this.directionsDisplay.setDirections(response);
            } else {
              console.error('Error in directions request:', status);
              alert('Could not display directions due to: ' + status);
              
            }
          });
        });
      }).catch(error => {
        console.error('Geolocation error:', error);
      })

  }

  goMaps(){
    if(this.typeAddress==1)
    window.location.href = "https://www.google.com/maps/search/?api=1&query="+this.latV+","+this.lngV;
    if(this.typeAddress==2)
    window.location.href = "https://www.google.com/maps/search/?api=1&query="+this.latC+","+this.lngC;
  }

}
