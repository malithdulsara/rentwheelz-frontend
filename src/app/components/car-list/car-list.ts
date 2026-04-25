import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CarService } from '../../services/car';
import { Car } from '../../models/car.model';

@Component({
  selector: 'app-car-list',
  imports: [CommonModule],
  templateUrl: './car-list.html',
  styleUrl: './car-list.css',
})
export class CarList implements OnInit {
  cars: Car[] = [];

  constructor(private carService: CarService,private cdr: ChangeDetectorRef) {}
  ngOnInit(): void {
    this.getAllCars();
  }

  getAllCars() {
   this.carService.getAllCars().subscribe({
  next: (res: Car[]) => {
    this.cars = [...res]; 
    console.log("Cars assigned to variable:", this.cars);
    this.cdr.detectChanges();
  },
  error: (err) => console.error(err)
});
  }
}
