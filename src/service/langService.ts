import { Injectable } from '@angular/core';
import { getFirestore } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { addDoc, doc, getDoc, updateDoc, collection } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class LangService {
  constructor(private matSnackBar: MatSnackBar, private router: Router) { }

  async getLangById(langId: string) {
    const db = getFirestore();

    const langRef = doc(db, 'languages', langId);
    const langSnap = await getDoc(langRef);

    if (langSnap.exists()) {
      return langSnap.data();
    } else {
      console.log('No such document!');
    }
  }

  async createLang(langData: any) {
    const db = getFirestore();

    try {
      await addDoc(collection(db, 'languages'), langData);

      this.matSnackBar.open("El idioma se ha creado correctamente", 'CERRAR', {duration: 3000});
      this.router.navigate(['language']);
      console.log('Language created successfully');
    } catch (error) {
      console.error('Error creating language:', error);
    }
  }

  async updateLang(langId: string, langData: any) {
    const db = getFirestore();

    try {
      const langRef = doc(db, 'languages', langId);
      await updateDoc(langRef, langData);

      this.matSnackBar.open("El idioma se ha modificado correctamente", 'CERRAR', {duration: 3000});
      this.router.navigate(['language']);
      console.log('Language updated successfully');
    } catch (error) {
      console.error('Error updating language:', error);
    }
  }
}
