import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { TodoComponent } from './todo/todo.component';
import { routeGuardGuard } from './route-guard.guard';
import { ProfileComponent } from './profile/profile.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
    {path: "", component : LoginComponent},
    {path: "register", component: RegisterComponent},
    {path: "home", component: HomeComponent, canActivate: [routeGuardGuard]},
    {path: "profile", component: ProfileComponent, canActivate: [routeGuardGuard]},
    {path: "edit-profile", component: ProfileEditComponent, canActivate: [routeGuardGuard]},
    {path: "**", component: PageNotFoundComponent}

];
