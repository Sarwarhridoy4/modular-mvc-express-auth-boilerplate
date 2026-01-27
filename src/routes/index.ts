import { Router} from "express";
import { UserRoutes } from '../app/modules/user/user.route.js';
import { AuthRoutes } from '../app/modules/auth/auth.route.js';


export const router = Router();

const moduleRoutes = [
 
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  }

];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});




