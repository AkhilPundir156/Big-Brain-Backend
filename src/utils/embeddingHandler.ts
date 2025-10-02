import { pipeline, FeatureExtractionPipeline } from "@xenova/transformers";

let _extractorInstance: FeatureExtractionPipeline | null = null;

export async function initEmbeddingExtractor(): Promise<FeatureExtractionPipeline> {
    if (!_extractorInstance) {
        _extractorInstance = await pipeline(
            "feature-extraction",
            "Xenova/all-MiniLM-L6-v2",
            {
                quantized: true,
            }
        );
    }
    return _extractorInstance;

}

//@ts-ignore
if (process.env.INITIALIZE_EMBEDDING == "1") {
    initEmbeddingExtractor();
}

export const computeEmbeddingHandler = async (query: string) => {
    if (!query || typeof query !== "string") {
        return {
            msg: "Query parameter is missing or invalid.",
        };
    }

    if (!_extractorInstance) {
        return {
            msg: "Service unavailable: Embedding model not loaded.",
        };
    }

    const output = await _extractorInstance([query], { pooling: "cls" });

    const queryEmbedding = output.tolist()[0];

    return {
        msg: "Embedding Computed Successfully",
        embedding: queryEmbedding,
    };
};
