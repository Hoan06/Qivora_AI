package project_backend.config;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {

    @Value("${spring.ai.google.genai.api-key}")
    private String apiKey;

    @Value("${spring.ai.google.genai.embedding.options.model:gemini-embedding-001}")
    private String embeddingModelName;


    @Bean
    public EmbeddingModel embeddingModel() {
        return new GeminiEmbeddingModel(apiKey, embeddingModelName);
    }
}
