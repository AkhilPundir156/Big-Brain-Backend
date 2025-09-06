import crypto from "crypto";
import { Request, Response } from "express";
import { z } from "zod";

import { asyncHandler } from "../middleware/asyncHandler.js";
import { contentModel, linkModel, tagModel } from "../models/brainSchema.js";
import { AuthenticatedRequest } from "../types/express.js";
import { computeEmbeddingHandler } from "../utils/embeddingHandler.js";
import { isValidMongoId } from "../utils/isValidMongoId.js";
import { LLMService } from "../utils/llmService.js";
import { prompts } from "../utils/query_prompt.js";
import { uploadCloudinary } from "../utils/cloudinaryHandler.js";

const llmService = new LLMService(process.env.OPENAI_API_KEY!);

// ---------------- Schema ----------------

export const contentSchema = z.object({
    tags: z.string(),
    link: z.string().optional(),
    type: z.string(),
    title: z.string(),
    description: z.string(),
});

type ContentType = z.infer<typeof contentSchema>;

// ---------------- Handlers ----------------

export const meHandler = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                msg: "Unauthorized",
                data: null,
            });
            return;
        }

        const myData = await contentModel
            .find({ userId })
            .select("-embedding")
            .populate("tags", "name");
        res.status(200).json({
            success: true,
            msg: "User content retrieved",
            data: myData,
        });
    }
);

export const createHandler = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        const contentData: ContentType = req.body;
        const parsed = contentSchema.safeParse(contentData);
        if (!parsed.success) {
            res.status(400).json({
                success: false,
                msg: "Invalid request data",
                data: parsed.error.flatten(),
            });
            return;
        }

        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                msg: "Unauthorized",
                data: null,
            });
            return;
        }

        let allTagIds: any[] = [];
        let tagData = [];
        try {
            tagData = JSON.parse(contentData.tags);
        } catch {
            tagData = [];
        }

        if (tagData?.length) {
            const existingTags = await tagModel.find({
                name: { $in: tagData },
            });
            const existingNames = existingTags.map((t) => t.name);

            const newTags = tagData.filter(
                (name: string) => !existingNames.includes(name)
            );
            let createdTags: any[] = [];
            if (newTags.length > 0) {
                createdTags = await tagModel.insertMany(
                    newTags.map((name: string) => ({ name }))
                );
            }

            allTagIds = [...existingTags, ...createdTags];
        }

        let url: string = "";
        if (req.file?.path) {
            const cloundinaryResponse = await uploadCloudinary(req.file.path);
            console.log(cloundinaryResponse.msg);
            url = cloundinaryResponse.data?.url as string;
        }

        let llmImgResponse = "";
        let embedding: any = { embedding: [] };

        if (url && url.length > 0) {
            [llmImgResponse, embedding] = await Promise.all([
                llmService.getImageDescription(
                    url,
                    prompts.image_description_prompt
                ),
                computeEmbeddingHandler(contentData.description),
            ]);
        } else {
            embedding = await computeEmbeddingHandler(contentData.description);
        }

        const createdDocument = await contentModel.create({
            ...contentData,
            userId,
            tags: allTagIds,
            embedding: embedding.embedding,
            fileUrl: url || "",
            fileDescription: llmImgResponse,
        });

        res.status(201).json({
            success: true,
            msg: "Content created successfully",
            data: createdDocument,
        });
    }
);

export const deleteHandler = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        const { contentId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                msg: "Unauthorized",
                data: null,
            });
            return;
        }

        if (!isValidMongoId(contentId)) {
            res.status(404).json({
                success: false,
                msg: "Content not found",
                data: null,
            });
            return;
        }

        const foundData = await contentModel.findOne({
            _id: contentId,
            userId,
        });
        if (!foundData) {
            res.status(404).json({
                success: false,
                msg: "Content not found",
                data: null,
            });
            return;
        }

        await foundData.deleteOne();
        res.status(200).json({
            success: true,
            msg: "Content deleted successfully",
            data: { id: contentId },
        });
    }
);

export const editHandler = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        const { contentId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                msg: "Unauthorized",
                data: null,
            });
            return;
        }
        if (!isValidMongoId(contentId)) {
            res.status(404).json({
                success: false,
                msg: "Content not found",
                data: null,
            });
            return;
        }

        const updatedContent = await contentModel
            .findOneAndUpdate(
                { _id: contentId, userId },
                { $set: { ...req.body } },
                { returnDocument: "after" }
            )
            .populate("tags", "name");

        if (!updatedContent) {
            res.status(404).json({
                success: false,
                msg: "Content not found",
                data: null,
            });
            return;
        }

        res.status(200).json({
            success: true,
            msg: "Content updated successfully",
            data: updatedContent,
        });
    }
);

export const contentDataHandler = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        const { contentId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                msg: "Unauthorized",
                data: null,
            });
            return;
        }
        if (!isValidMongoId(contentId)) {
            res.status(404).json({
                success: false,
                msg: "Content not found",
                data: null,
            });
            return;
        }

        const foundContent = await contentModel
            .findOne({ _id: contentId, userId })
            .populate("tags", "name")
            .select("-embedding");

        if (!foundContent) {
            res.status(404).json({
                success: false,
                msg: "Content not found",
                data: null,
            });
            return;
        }

        res.status(200).json({
            success: true,
            msg: "Content retrieved successfully",
            data: foundContent,
        });
    }
);

export const hashedContentHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const { hashId } = req.params;

        const founduserId = await linkModel.findOne({ hash: hashId });

        if (!founduserId) {
            res.status(404).json({
                success: false,
                msg: "content not found",
                data: null,
            });
            return;
        }

        const foundContent = await contentModel
            .find({
                userId: founduserId.userId,
            })
            .select("-embedding");

        res.status(200).json({
            success: true,
            msg: "Content found",
            data: foundContent,
        });
    }
);

export const searchHandler = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        const { query } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                msg: "Unauthorized",
                data: null,
            });
            return;
        }
        if (!query || typeof query !== "string") {
            res.status(400).json({
                success: false,
                msg: "Query parameter is missing or invalid",
                data: null,
            });
            return;
        }

        const embedding = await computeEmbeddingHandler(query);

        const foundContent = await contentModel.aggregate([
            {
                $vectorSearch: {
                    index: "embedding",
                    path: "embedding",
                    queryVector: embedding.embedding,
                    numCandidates: 1024,
                    limit: 5,
                },
            },
            { $project: { description: 1, fileDescription: 1 } },
        ]);

        if (!process.env.OPENAI_API_KEY) {
            res.status(500).json({
                success: false,
                msg: "OpenAI API key missing",
                data: null,
            });
            return;
        }

        try {
            const response = await llmService.getResponse(
                query,
                prompts.query_system_prompt,
                foundContent
            );

            res.status(200).json({
                success: true,
                msg: "Search completed",
                data: { results: foundContent, llmResponse: response },
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                msg: "LLM service failed",
                data: error,
            });
        }
    }
);

export const generateShareLink = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                msg: "Unauthorized",
            });
        }

        const content = await contentModel.find({ userId });
        if (!content) {
            return res.status(404).json({
                success: false,
                msg: "Content not found",
            });
        }

        const hash = crypto.randomBytes(16).toString("hex");

        const shareLink = await linkModel.create({
            hash,
            userId,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        res.status(201).json({
            success: true,
            msg: "Share link created",
            data: {
                url: `${process.env.CLIENT_URL}/share/${hash}`,
                expiresAt: shareLink.expiresAt,
            },
        });
    }
);
