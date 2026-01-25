import { Router, type Request, type Response } from "express";

export const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the Inventory Management System API");
});

