import { Router } from "express";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { upload } from "../middleware/uploadFile.js";
import {
    generateShareLink,
    searchHandler,
    contentDataHandler,
    createHandler,
    deleteHandler,
    editHandler,
    hashedContentHandler,
    meHandler,
} from "../controllers/brainController.js";

const BrainRouter = Router();

// Get all user content
BrainRouter.get("/me", isAuthenticated, meHandler);

// Create new content
BrainRouter.post("/create", isAuthenticated, upload.single('uploaded_file'), createHandler);

// Search on basis of query. -----------------> To be added the recent Chat context for full fleged chatting.
BrainRouter.post("/search", isAuthenticated, searchHandler);

// Delete content by ID
BrainRouter.delete("/:contentId", isAuthenticated, deleteHandler);

// Edit content by ID
BrainRouter.put("/:contentId", isAuthenticated, editHandler);

// Get content by ID
BrainRouter.get("/:contentId", isAuthenticated, contentDataHandler);

// Publicly accessible shared content by hash
BrainRouter.get("/share/:hashId", hashedContentHandler);

// Generate share link
BrainRouter.post("/share", isAuthenticated, generateShareLink);



export default BrainRouter;
