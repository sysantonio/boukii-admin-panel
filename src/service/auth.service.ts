import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, onAuthStateChanged, getAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { User } from '@firebase/auth';
import { createUserWithEmailAndPassword } from '@angular/fire/auth';
import { UserService } from './userService';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getFirestore } from '@angular/fire/firestore';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import { ApiCrudService } from './crud.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService extends ApiService {
  user: User | null = null;

  constructor(private auth: Auth,private router: Router, http: HttpClient, private crudService: ApiCrudService) {
    super(http)
    const user = JSON.parse(localStorage.getItem('boukiiUser'));
    if (user) {
      this.user = user;
    }

    /*onAuthStateChanged(auth, (user) => {
      if (user) {
        this.user = user;
        localStorage.setItem('boukiiUser', JSON.stringify(user));
      } else {
        this.user = null;
        localStorage.removeItem('boukiiUser');
      }
    });*/
  }

  async login(email: string, password: string) {
    try {

      this.crudService.login('/admin/login', {email: email, password: password})
        .subscribe((data: any) => {

          localStorage.setItem('boukiiUser', JSON.stringify(data.data.user));
          localStorage.setItem('boukiiUserToken', JSON.stringify(data.data.token));
          this.user = data.data.user;
          this.router.navigate(['/home']);
        })
    } catch (error) {
      console.error('Error during login:', error);
    }
  }

  async register(email: string, password: string): Promise<void> {
    try {
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, email, password);
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error during registration:', error);
    }
  }

  async logout() {
    await signOut(this.auth);
    this.user = null;
    localStorage.removeItem('boukiiUser');
  }

  isLoggedIn() {
    return this.user !== null;
  }

}
