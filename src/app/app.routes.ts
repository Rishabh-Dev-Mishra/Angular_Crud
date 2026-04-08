import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { TodoComponent } from './todo/todo.component';
import { routeGuardGuard } from './route-guard.guard';
import { ProfileComponent } from './profile/profile.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { HomeComponent } from './home/home.component';
import { BrandsComponent } from './brands/brands.component';
import { CarsComponent } from './cars/cars.component';
import { BrandEntryComponent } from './brand-entry/brand-entry.component';
import { CarEntryComponent } from './car-entry/car-entry.component';
import { AllCarsComponent } from './allcars/allcars.component';

export const routes: Routes = [
    {path: "", component : LoginComponent},
    {path: "register", component: RegisterComponent},
    {path: "home", component: HomeComponent, canActivate: [routeGuardGuard]},
    {path: "profile", component: ProfileComponent, canActivate: [routeGuardGuard]},
    {path: "edit-profile/:user_id", component: ProfileEditComponent, canActivate: [routeGuardGuard]},
    {path: "brands/:id", component: BrandsComponent, canActivate: [routeGuardGuard]},
    {path: "cars/:id/:name", component: CarsComponent, canActivate: [routeGuardGuard]},
    {path: "brand_details", component: BrandEntryComponent},
    {path: "car_details/:user_id", component: CarEntryComponent},
    {path: "editCar/:car_id", component: CarEntryComponent},
    {path: "allcars", component:AllCarsComponent},
    {path: "**", component: PageNotFoundComponent}

];
