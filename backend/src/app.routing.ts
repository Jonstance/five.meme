import { Router } from "express";
import { ProjectController } from "./controllers/project.controller";
import { AppRoute } from "./app-route";
import { AdminController } from "./controllers/admin.controller";
import bondingLaunchesRouter from "./routes/bondingLaunches.routes";

export class AppRouting {
  constructor(private route: Router) {
    this.route = route;
    this.configure();
  }

  public configure() {
    // Add test route FIRST for debugging
    this.addTestRoute();

    // Add bonding curve routes
    this.route.use('/api/bonding-launches', bondingLaunchesRouter);

    // Add the routing classes.
    this.addRoute(new AdminController());
    this.addRoute(new ProjectController());
  }

  private addTestRoute() {
    // Add test CORS route
    this.route.get('/test-cors', (req, res) => {
      console.log('Test CORS route hit');
      console.log('Origin:', req.get('Origin'));
      console.log('Method:', req.method);
      console.log('Headers:', req.headers);
      
      res.json({ 
        message: 'CORS test successful',
        origin: req.get('Origin'),
        timestamp: new Date().toISOString(),
        method: req.method
      });
    });
  }

  private addRoute(appRoute: AppRoute) {
    this.route.use(appRoute.route, appRoute.router);
  }
}