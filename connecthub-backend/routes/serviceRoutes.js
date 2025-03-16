const express = require("express");
const {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  searchServices,
} = require("../controllers/serviceController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/", auth, createService);
router.get("/", getServices);
router.get("/search", searchServices);
router.get("/:id", getServiceById);
router.put("/:id", auth, updateService);
router.delete("/:id", auth, deleteService);

module.exports = router;
