import { Injectable } from '@angular/core';
import { getAuth } from '@angular/fire/auth';
import { getFirestore } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { addDoc, doc, getDoc, updateDoc, collection} from 'firebase/firestore';
import { createUserWithEmailAndPassword, updatePassword  } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private matSnackBar: MatSnackBar, private router: Router) { }

  async getLangById(langId: string) {
    const db = getFirestore();

    const langRef = doc(db, 'users', langId);
    const langSnap = await getDoc(langRef);

    if (langSnap.exists()) {
      return langSnap.data();
    } else {
      console.log('No such document!');
    }
  }

  async createUser(userData: any) {
    const db = getFirestore();

    try {

      try {
        const auth = getAuth();
        await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      } catch (error) {
        console.error('Error during registration:', error);
      }

      await addDoc(collection(db, 'users'), {name: userData.name, surname: userData.surname, email: userData.email, rol: userData.rol});

      this.matSnackBar.open("El usuario se ha creado correctamente", 'CERRAR', {duration: 3000});
      this.router.navigate(['user']);
      console.log('User created successfully');
    } catch (error) {
      console.error('Error creating user:', error);
    }
  }
}
