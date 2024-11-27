import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import * as firebase from 'firebase';
import { AngularFirestore } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';


export class AuthInfo {
  constructor(public $uid: string) { }

  isLoggedIn() {
    return !!this.$uid;
  }
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  static UNKNOWN_USER = new AuthInfo(null);
  db = firebase.firestore();
  public authInfo$: BehaviorSubject<AuthInfo> = new BehaviorSubject<AuthInfo>(ApiService.UNKNOWN_USER);
  constructor(
    private fireAuth: AngularFireAuth,
    private adb: AngularFirestore,
    private http: HttpClient
  ) { }

  public checkAuth() {
    return new Promise((resolve) => {
      this.fireAuth.auth.onAuthStateChanged(user => {
        resolve(user);
      });
    });
  }

  public login(email: string, password: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.fireAuth.auth.signInWithEmailAndPassword(email, password)
        .then(res => {
          if (res.user) {
            this.db.collection('users').doc(res.user.uid).update({
              fcm_token: localStorage.getItem('fcm') ? localStorage.getItem('fcm') : '',
            });
            this.authInfo$.next(new AuthInfo(res.user.uid));
            resolve(res.user);
          }
        })
        .catch(err => {

          this.authInfo$.next(ApiService.UNKNOWN_USER);
          reject(`login failed ${err}`)
        });
    });
  }


  public updateProfile(uid: string, param: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.db.collection('users').doc(uid).update(param).then(() => {
        
        resolve({ success: true, message: 'Profile updated successfully' });
      }).catch(error => {
        
        reject(error);
      });
    });
  }
  

  public register(email: string, password: string, fname: string, lname): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.fireAuth.auth.createUserWithEmailAndPassword(email, password)
        .then(res => {
          if (res.user) {
            this.db.collection('users').doc(res.user.uid).set({
              uid: res.user.uid,
              email: email,
              fname: fname,
              lname: lname,
              type: 'venue'
            });
            this.authInfo$.next(new AuthInfo(res.user.uid));
            resolve(res.user);
          }
        })
        .catch(err => {

          this.authInfo$.next(ApiService.UNKNOWN_USER);
          reject(`login failed ${err}`);
        });
    });
  }

  public logout(): Promise<void> {
    this.authInfo$.next(ApiService.UNKNOWN_USER);
    // this.db.collection('users').doc(localStorage.getItem('uid')).update({ 'fcm_token': firebase.firestore.FieldValue.delete() })
    return this.fireAuth.auth.signOut();
  }

  public resetPassword(email: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.fireAuth.auth.sendPasswordResetEmail(email)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(`reset failed ${err}`);
        });
    });
  }

  public checkEmail(email: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.fireAuth.auth.fetchSignInMethodsForEmail(email).then((info: any) => {
        resolve(info);
      }).catch(error => {
        reject(error);
      });
    });
  }

  public getProfile(id): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb.collection('users').doc(id).get().subscribe((profile: any) => {
        resolve(profile.data());
      }, error => {
        reject(error);
      });
    });
  }


  public getMyReviews(id): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb.collection('driverreviews', ref => ref.where('dId', '==', id)).get().subscribe(async (review) => {
        let data = review.docs.map((element) => {
          let item = element.data();
          item.id = element.id;
          if (item && item.uid) {
            item.uid.get().then(function (doc) {
              item.uid = doc.data();
            });
          }
          return item;
        });
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }

  public getMessages(id): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb.collection('messages').doc(id).collection('chats').get().subscribe((messages: any) => {
        console.log(messages);
        let data = messages.docs.map(element => {
          let item = element.data();
          item.id = element.id;
          return item;
        });
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }


  sendNotification(msg, title, id) {
    const body = {
      app_id: environment.onesignal.appId,
      include_player_ids: [id],
      headings: { en: title },
      contents: { en: msg },
      data: { task: msg }
    };
    const header = {
      headers: new HttpHeaders()
        .set('Content-Type', 'application/json')
        .set('Authorization', `Basic ${environment.onesignal.restKey}`)
    };
    return this.http.post('https://onesignal.com/api/v1/notifications', body, header);
  }

  public getMyOrders(id): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.adb.collection('orders', ref => ref.where('driverId', '==', id)).get().subscribe((venue) => {
        let data = venue.docs.map((element) => {
          let item = element.data();
          item.vid.get().then(function (doc) {
            item.vid = doc.data();
            item.vid.id = doc.id;
          });
          item.uid.get().then(function (doc) {
            item.uid = doc.data();
            item.uid.id = doc.id;
          });
          item.id = element.id;
          return item;
        });
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }

  public getOrderById(id): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      this.adb.collection('orders').doc(id).get().subscribe(async (order: any) => {
        let data = await order.data();
        await data.vid.get().then(function (doc) {
          data.vid = doc.data();
          data.vid.id = doc.id;
          
        });
        await data.dId.get().then(function (doc) {
          data.dId = doc.id;
          data.dId = doc.data();
        })
        await data.uid.get().then(function (doc) {
          data.uid = doc.id;
          data.uid = doc.data();
        })

         
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }

  public updateOrderStatus(id, value): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      let statusMessage = '';
      const currentDateTime = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }

     const formattedDateTime: string = currentDateTime.toLocaleDateString('es-ES', options); 


      switch(value){
        case 'delivered':
          statusMessage = `El pedido fue entregado con éxito el - ${formattedDateTime}`;
          break;
        case 'canceled':
          statusMessage = `El pedido fue cancelado - ${formattedDateTime}`;
          break;
        case 'ongoing':
            statusMessage = `El pedido fue aceptado - ${formattedDateTime}`;
            break;
        case 'torestaurant':
              statusMessage = `El repartidor va hacia el restaurante - ${formattedDateTime}`;
              break;
        case 'todestiny':
              statusMessage = `El repartidor va hacia el destino - ${formattedDateTime}`;
              break;
        default:
          statusMessage = "El estado del pedido ha cambiado - ${formattedDateTime}";
          break;
      }

      this.adb.collection('orders').doc(id).update({
        status: value, 
        streetHistory: firebase.firestore.FieldValue.arrayUnion(statusMessage) }).then(async (order: any) => {
        resolve(order);
      }).catch(error => {
        reject(error);
      });
    });
  }

  // Método para agregar una calle al historial de una orden
  updateOrderStreetHistory(orderId: string, street: string): Promise<any> {

    const currentDateTime = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }

     const formattedDateTime: string = currentDateTime.toLocaleDateString('es-ES', options); 

    return this.adb.collection('orders').doc(orderId).get().toPromise()
      .then(doc => {
        if (doc.exists) {
          const orderData = doc.data();
          
         
          if (!orderData.streetHistory) {
            orderData.streetHistory = [];
          }

         
          return this.adb.collection('orders').doc(orderId).update({
            streetHistory: firebase.firestore.FieldValue.arrayUnion(`El repartidor paso por la calle ${street} - ${formattedDateTime}`)
          });
        } else {
          console.log(`No se encontró la orden con ID: ${orderId}`);
          return Promise.reject("Orden no encontrada");
        }
      })
      .catch(error => {
        console.error("Error al obtener la orden o actualizar el historial de calles:", error);
        return Promise.reject(error);
      });
  }

   // Método para obtener las órdenes en tiempo real
   public getOrders(uid: string) {
    return this.adb.collection('orders', ref => ref.where('userId', '==', uid))
      .snapshotChanges();  // Esto escucha las actualizaciones en tiempo real
  }
  
}
