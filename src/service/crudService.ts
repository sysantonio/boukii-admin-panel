import { Injectable } from '@angular/core';
import { getFirestore } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { addDoc, doc, getDoc, updateDoc, collection } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class CrudService {
  constructor(private matSnackBar: MatSnackBar, private router: Router) { }

  async get(id: string, model: string) {
    const db = getFirestore();

    const langRef = doc(db, model, id);
    const langSnap = await getDoc(langRef);

    if (langSnap.exists()) {
      return langSnap.data();
    } else {
      console.log('No such document!');
    }
  }

  async create(data: any, model: string, route: string) {
    const db = getFirestore();

    try {
      await addDoc(collection(db, model), data);

      this.matSnackBar.open("El registro se ha creado correctamente", 'CERRAR', {duration: 3000});
      this.router.navigate([route]);
    } catch (error) {
      console.error('Error creating language:', error);
    }
  }

  async update(id: string, data: any, model: string, route: string) {
    const db = getFirestore();

    try {
      const langRef = doc(db, model, id);
      await updateDoc(langRef, data);

      this.matSnackBar.open("El registro se ha modificado correctamente", 'CERRAR', {duration: 3000});
      this.router.navigate([route]);
      console.log('Language updated successfully');
    } catch (error) {
      console.error('Error updating language:', error);
    }
  }
}
