import { Router} from "express";
import { UserRoutes } from '../app/modules/user/user.route.js';
import { AuthRoutes } from '../app/modules/auth/auth.route.js';
import { apiLogRoutes } from "../app/modules/api-log/api-log.route.js";


export const router = Router();

const moduleRoutes = [
 
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/logs",
    route: apiLogRoutes,
  }

];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});




