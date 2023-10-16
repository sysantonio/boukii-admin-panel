import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, onAuthStateChanged, getAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { User } from '@firebase/auth';
import { createUserWithEmailAndPassword } from '@angular/fire/auth';
import { UserService } from './userService';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: User | null = null;

  constructor(private auth: Auth,private router: Router, private userService: UserService) {
    const user = JSON.parse(localStorage.getItem('boukiiUser'));
    if (user) {
      this.user = user;
    }
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.user = user;
        localStorage.setItem('boukiiUser', JSON.stringify(user));
      } else {
        this.user = null;
        localStorage.removeItem('boukiiUser');
      }
    });
  }

  async login(email: string, password: string) {
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        localStorage.setItem('boukiiUser', JSON.stringify(userCredential.user));
        this.router.navigate(['/user']);
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  }

  async register(email: string, password: string): Promise<void> {
    try {
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, email, password);
      this.router.navigate(['/user']);
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

  async getUserByEmail(email: string) {
    const db = getFirestore();
    const usersRef = collection(db, 'usuarios');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    let user;

    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());
      user = doc.data();
    });

    return user;
  }
}
