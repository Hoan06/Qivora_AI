package project_backend.config;

import com.google.genai.Client;
import com.google.genai.types.ContentEmbedding;
import com.google.genai.types.EmbedContentConfig;
import com.google.genai.types.EmbedContentResponse;
import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.AbstractEmbeddingModel;
import org.springframework.ai.embedding.Embedding;
import org.springframework.ai.embedding.EmbeddingRequest;
import org.springframework.ai.embedding.EmbeddingResponse;

import java.util.ArrayList;
import java.util.List;

public class GeminiEmbeddingModel extends AbstractEmbeddingModel {

    private final Client client;
    private final String modelName;

    public GeminiEmbeddingModel(String apiKey, String modelName) {
        this.client = Client.builder().apiKey(apiKey).build();
        this.modelName = modelName;
    }

    @Override
    public EmbeddingResponse call(EmbeddingRequest request) {
        List<String> texts = request.getInstructions();

        EmbedContentConfig config = EmbedContentConfig.builder()
                .outputDimensionality(768)
                .build();

        // Gọi Google GenAI SDK chính hãng
        EmbedContentResponse response = client.models.embedContent(
                modelName,
                texts,
                config
        );

        List<ContentEmbedding> embeddings = response.embeddings().orElse(List.of());
        List<Embedding> embeddingList = new ArrayList<>();

        for (int i = 0; i < embeddings.size(); i++) {
            List<Float> values = embeddings.get(i).values().orElse(List.of());
            float[] vector = new float[values.size()];
            for (int j = 0; j < values.size(); j++) {
                vector[j] = values.get(j);
            }
            embeddingList.add(new Embedding(vector, i));
        }

        return new EmbeddingResponse(embeddingList);
    }

    @Override
    public float[] embed(Document document) {
        return embed(document.getText());
    }

    @Override
    public int dimensions() {
        return 768;
    }
}
