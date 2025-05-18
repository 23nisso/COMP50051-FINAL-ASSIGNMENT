import { Router } from "express";
import { LeaveRequestController } from "../controller/controllers/LeaveRequestController";
import { MiddlewareFactory } from "../middlewares/MiddlewareFactory";

const router = Router();
const leaveRequestController = new LeaveRequestController();

router.use(MiddlewareFactory.authenticateToken);

router.post(
  "/",
  MiddlewareFactory.authoriseRoles([1, 3]),
  leaveRequestController.create.bind(leaveRequestController)
);

router.get(
  "/pending",
  MiddlewareFactory.authoriseRoles([1, 2]),
  leaveRequestController.getPendingRequests.bind(leaveRequestController)
);

router.patch(
  "/:id/approve",
  MiddlewareFactory.authoriseRoles([1, 2]),
  leaveRequestController.approved.bind(leaveRequestController)
);

router.patch(
  "/:id/reject",
  MiddlewareFactory.authoriseRoles([1, 2]),
  leaveRequestController.rejected.bind(leaveRequestController)
);

router.delete(
  "/",
  MiddlewareFactory.authoriseRoles([1, 3]),
  leaveRequestController.cancelled.bind(leaveRequestController)
);

router.get(
  "/status/:id",
  MiddlewareFactory.authoriseRoles([3]),
  leaveRequestController.getMyRequests
);
export default router;
