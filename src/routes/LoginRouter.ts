import { Router } from "express";
import { LoginController } from "../controllers/LoginController";

export const LoginRouter = (controller: LoginController): Router => {
  const router = Router();
  router.post("/login", (req, res) => controller.login(req, res));
  return router;
};
