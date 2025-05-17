import { Router } from "express";
import { UserController } from "../controller/controllers/UserController";
import { MiddlewareFactory } from "../middlewares/MiddlewareFactory";

const router = Router();
const userController = new UserController();

router.use(MiddlewareFactory.authenticateToken);

router.get(
  "/:id/leave-balance",
  MiddlewareFactory.authoriseRoles([1, 2]),
  userController.getLeaveBalance
);

router.get(
  "/",
  MiddlewareFactory.authoriseRoles([1]),
  userController.getAllUsers
);

router.post(
  "/",
  MiddlewareFactory.authoriseRoles([1]),
  userController.create
);

router.patch(
  "/:id",
  MiddlewareFactory.authoriseRoles([1]),
  userController.update
);

router.delete(
  "/:id",
  MiddlewareFactory.authoriseRoles([1]),
  userController.delete
);

export default router;
