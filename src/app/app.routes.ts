import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { TodoComponent } from './todo/todo.component';
import { routeGuardGuard } from './route-guard.guard';
import { ProfileComponent } from './profile/profile.component';

export const routes: Routes = [
    {path: "", component : LoginComponent},
    {path: "register", component: RegisterComponent},
    {path: "home", component: TodoComponent, canActivate: [routeGuardGuard]},
    {path: "profile", component: ProfileComponent}
];
