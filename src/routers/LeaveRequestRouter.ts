import { Router } from "express";
import { LeaveRequestController } from "../controller/controllers/LeaveRequestController";
import { MiddlewareFactory } from "../middlewares/MiddlewareFactory";

const router = Router();
const leaveRequestController = new LeaveRequestController();

router.use(MiddlewareFactory.authenticateToken);

router.post(
  "/",
  MiddlewareFactory.authorizeRoles(["staff"]),
  leaveRequestController.create
);

router.get(
  "/pending",
  MiddlewareFactory.authorizeRoles(["manager", "admin"]),
  leaveRequestController.getPendingRequests 
);

router.patch(
  "/:id/approve",
  MiddlewareFactory.authorizeRoles(["manager", "admin"]),
  leaveRequestController.approved
);

router.patch(
  "/:id/reject",
  MiddlewareFactory.authorizeRoles(["manager", "admin"]),
  leaveRequestController.rejected
);

router.delete(
  "/",
  MiddlewareFactory.authorizeRoles(["staff"]),
  leaveRequestController.cancelled
);

export default router
