const express = require("express");
const router = express.Router();
const moduleController = require("../controllers/moduleController");
const { protect, admin } = require("../middleware/auth");

// Admin routes
router.post("/", protect, admin, moduleController.createModule);
router.post(
  "/generate",
  protect,
  admin,
  moduleController.generateModuleContent
);
router.put("/:id", protect, admin, moduleController.updateModule);
router.delete("/:id", protect, admin, moduleController.deleteModule);

// Accessible by all authenticated users
router.get("/", protect, moduleController.getModules);
router.get("/:id", protect, moduleController.getModule);

// Trainee specific routes
router.put("/:id/progress", protect, moduleController.updateProgress);
router.get("/trainee/progress", protect, moduleController.getTraineeProgress);

module.exports = router;
