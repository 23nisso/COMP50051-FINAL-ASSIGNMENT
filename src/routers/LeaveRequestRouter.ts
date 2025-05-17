import { Router } from "express";
import { LeaveRequestController } from "../controller/controllers/LeaveRequestController";
import { MiddlewareFactory } from "../middlewares/MiddlewareFactory";

const router = Router();
const leaveRequestController = new LeaveRequestController();

router.use(MiddlewareFactory.authenticateToken);

router.post(
  "/",
  MiddlewareFactory.authoriseRoles([3]),
  leaveRequestController.create
);

router.get(
  "/pending",
  MiddlewareFactory.authoriseRoles([1, 2]),
  leaveRequestController.getPendingRequests 
);

router.patch(
  "/:id/approve",
  MiddlewareFactory.authoriseRoles([1, 2]),
  leaveRequestController.approved
);

router.patch(
  "/:id/reject",
  MiddlewareFactory.authoriseRoles([1, 2]),
  leaveRequestController.rejected
);

router.delete(
  "/",
  MiddlewareFactory.authoriseRoles([3]),
  leaveRequestController.cancelled
);

export default router
