import { Router } from "express";
import { UserController } from "../controller/controllers/UserController";
import { MiddlewareFactory } from "../middlewares/MiddlewareFactory";

const router = Router();
const userController = new UserController();

router.use(MiddlewareFactory.authenticateToken);

router.get(
  "/:id/leave-balance",
  MiddlewareFactory.authorizeRoles(["manager", "admin"]),
  userController.getLeaveBalance
);

router.get(
  "/",
  MiddlewareFactory.authorizeRoles(["admin"]),
  userController.getAllUsers
);

router.post(
  "/",
  MiddlewareFactory.authorizeRoles(["admin"]),
  userController.create
);

router.patch(
  "/:id",
  MiddlewareFactory.authorizeRoles(["admin"]),
  userController.update
);

router.delete(
  "/:id",
  MiddlewareFactory.authorizeRoles(["admin"]),
  userController.delete
);

export default router;
