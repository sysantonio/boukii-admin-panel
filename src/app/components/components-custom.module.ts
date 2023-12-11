import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LevelUserComponent } from './level-user/level-user.component';


@NgModule({
  declarations: [LevelUserComponent],
  imports: [
    CommonModule, FormsModule
  ],
  exports: [LevelUserComponent]
})
export class ComponentsCustomModule { }
