import {NgModule, Component, signal, Injectable} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {WeatherForecasts} from '../types/weatherForecast';
import {CommonModule} from '@angular/common';

@Injectable()
@Component({
  selector: 'app-root',
  imports: [RouterOutlet,CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('MyForm.AngularApp');
  forecasts: WeatherForecasts = [];

  constructor(private http: HttpClient) {
    http.get<WeatherForecasts>('api/weatherforecast').subscribe({
      next: result => this.forecasts = result,
      error: console.error
    });
  }
}
