import { Router } from "express";
import { DepartmentController } from "../controller/controllers/DepartmentController";
import { MiddlewareFactory } from "../middlewares/MiddlewareFactory";

const router = Router();
const departmentController = new DepartmentController();

router.use(MiddlewareFactory.authenticateToken);

router.get(
  "/",
  MiddlewareFactory.authorizeRoles(["admin"]),
  departmentController.getAll
);

router.post(
  "/",
  MiddlewareFactory.authorizeRoles(["admin"]),
  departmentController.create
);

router.get(
  "/:id/users",
  MiddlewareFactory.authorizeRoles(["admin", "manager"]),
  departmentController.getUsersInDepartment
);

export default router;