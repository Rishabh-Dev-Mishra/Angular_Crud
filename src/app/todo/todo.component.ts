import { Component, inject } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { NgFor } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [FooterComponent, NavbarComponent, FormsModule, NgFor],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.css'
})
export class TodoComponent {
  newTask: string = '';
  tasks: string[] = [];
  add(){
    if(this.newTask.trim() !== ''){
      this.tasks.push(this.newTask)
      this.newTask = '';
    }
  }
}
