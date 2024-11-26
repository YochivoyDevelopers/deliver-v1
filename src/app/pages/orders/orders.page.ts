import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { UtilService } from 'src/app/services/util.service';
@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit {

  seg_id = 1;
  orders: any = [];
  oldOrders: any;
  dummy = Array(50);
  constructor(
    private router: Router,
    private api: ApiService,
    private util: UtilService,
    private adb: AngularFirestore) {
    // this.getOrders();
    if (localStorage.getItem('uid')) {
      this.adb.collection('orders', ref =>
        ref.where('driverId', '==', localStorage.getItem('uid'))).snapshotChanges().subscribe((data: any) => {
          console.log('paylaoddddd----->>>>', data);
          if (data) {
            this.getOrders();
          }
        }, error => {
          console.log(error);
        });
    }
  }

  ngOnInit() {

  }

  onClick(val) {
    this.seg_id = val;
  }

  getOrders() {
    this.orders = [];
    this.oldOrders = [];
    this.api.getMyOrders(localStorage.getItem('uid')).then((data: any) => {
      this.dummy = [];
      if (data) {
        data.forEach(element => {
          element.order = JSON.parse(element.order);
          if (element.vid) {
            element.vid.get().then(docSnapshot => {
              if (docSnapshot.exists) {
                const restaurantData = docSnapshot.data(); 
  
               
                const restaurantLat = restaurantData.lat;
                const restaurantLng = restaurantData.lng;
  
                
                const destinationLat = element.address.lat;
                const destinationLng = element.address.lng;
  
                
                const currentLat = parseFloat(localStorage.getItem("lat"));
                const currentLng = parseFloat(localStorage.getItem("lng"));
  
                
                const distanceCurrentToRestaurant = this.calculateDistance(currentLat, currentLng, restaurantLat, restaurantLng);
                const distanceRestaurantToDestination = this.calculateDistance(restaurantLat, restaurantLng, destinationLat, destinationLng);

                const totalDistance = distanceRestaurantToDestination + distanceCurrentToRestaurant;
  
  
                
                if (totalDistance <= 5) {
                  element.deliveryCharge = 20; 
                } else if (totalDistance <= 10) {
                  element.deliveryCharge = 30; 
                } else {
                  element.deliveryCharge = 50;
                }
  
               
                if (element.status === 'accepted') {
                  
                  const deliveryCharge = parseFloat(element.deliveryCharge) || 0;
                  const serviceTax = parseFloat(element.serviceTax) || 0;
                  const total = parseFloat(element.total) || 0;
  
                  let grandTotal = deliveryCharge + serviceTax + total;
                  
                  this.adb.collection('orders').doc(element.id).update({
                    deliveryCharge: element.deliveryCharge,
                    grandTotal: grandTotal
                  }).then(() => {
                    console.log(`deliveryCharge actualizado a ${element.deliveryCharge} para el pedido con ID: ${element.id}`);
                  }).catch(error => {
                    console.log(`Error al actualizar deliveryCharge para el pedido con ID: ${element.id}`, error);
                  });
                }
  
                if (element.status === 'delivered' || element.status === 'canceled' || element.status === 'rejected') {
                  if (element.status !== 'rejected') {
                    this.oldOrders.push(element);
                  }
                } else {
                  this.orders.push(element);
                }
              } else {
                console.log('No se encontró el restaurante para el pedido con ID:', element.id);
              }
            }).catch(error => {
              console.log('Error al obtener datos del restaurante para el pedido con ID:', element.id, error);
            });
          }
        });
      }
    }).catch(error => {
      this.dummy = [];
      console.log('Error al obtener pedidos', error);
    });
  }
  
  
  
  
  
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; 
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
  }
  
  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
  

  goToOrderDetail(ids) {

    const navData: NavigationExtras = {
      queryParams: {
        id: ids
      }
    };

    this.router.navigate(['/order-detail'], navData);
  }
  getProfilePic(item) {
    return item && item.cover ? item.cover : 'assets/imgs/user.jpg';
  }

  getCurrency() {
    return this.util.getCurrecySymbol();
  }

  

}
