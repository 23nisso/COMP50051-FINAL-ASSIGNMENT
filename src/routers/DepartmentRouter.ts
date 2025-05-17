import { Router } from "express";
import { DepartmentController } from "../controller/controllers/DepartmentController";
import { MiddlewareFactory } from "../middlewares/MiddlewareFactory";

const router = Router();
const departmentController = new DepartmentController();

router.use(MiddlewareFactory.authenticateToken);

router.get(
  "/",
  MiddlewareFactory.authoriseRoles([1]),
  departmentController.getAll
);

router.post(
  "/",
  MiddlewareFactory.authoriseRoles([1]),
  departmentController.create
);

router.get(
  "/:id/users",
  MiddlewareFactory.authoriseRoles([1, 2]),
  departmentController.getUsersInDepartment
);

export default router;