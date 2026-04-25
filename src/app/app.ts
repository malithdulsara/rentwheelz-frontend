import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { CarList } from "./components/car-list/car-list";
import { MainLayout } from "./core/main-layout/main-layout";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CarList, MainLayout],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit{
  ngOnInit(): void {
    initFlowbite();
  }
  protected readonly title = signal('rentwheelz-frontend');
}
