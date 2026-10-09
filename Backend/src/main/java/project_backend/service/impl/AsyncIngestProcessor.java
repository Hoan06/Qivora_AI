package project_backend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.pgvector.PgVectorStore;
import org.springframework.core.io.Resource;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import project_backend.exception.NotFoundException;
import project_backend.model.enum_entity.DocumentStatus;
import project_backend.repository.DocumentRepository;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AsyncIngestProcessor {
    private final PgVectorStore pgVectorStore;
    private final DocumentRepository documentRepository;

    @Async
    public void processIngestDocument(Long documentId , Resource resource) {
        log.info("Processing ingest document {}", documentId);

        project_backend.model.entity.Document documentEntity = documentRepository.findById(documentId).orElse(null);
        if (documentEntity == null) {
            log.error("Không tìm thấy document ID: {} trong cơ sở dữ liệu!", documentId);
            return;
        }

        try {
            TikaDocumentReader reader = new TikaDocumentReader(resource);
            List<Document> documents = reader.get();

            if (documents.isEmpty()) {
                throw new IllegalStateException("Không thể trích xuất nội dung văn bản từ tài liệu này!");
            }

            TokenTextSplitter splitter = TokenTextSplitter.builder()
                    .withChunkSize(800)
                    .withMinChunkSizeChars(20)
                    .withKeepSeparator(true)
                    .withMaxNumChunks(10000)
                    .build();

            List<Document> chunkDocuments = splitter.apply(documents);

            if (chunkDocuments.isEmpty()) {
                throw new IllegalStateException("Không có đoạn văn bản (chunk) nào được tạo sau khi cắt nhỏ!");
            }

            for (Document chunk : chunkDocuments) {
                chunk.getMetadata().put("document_id" , documentId);
                chunk.getMetadata().put("document_name" , documentEntity.getName());
                chunk.getMetadata().put("is_active" , true);
            }

            pgVectorStore.accept(chunkDocuments);

            documentEntity.setStatus(DocumentStatus.COMPLETED);
            documentEntity.setChunkCount(chunkDocuments.size());
            documentRepository.save(documentEntity);
            log.info("Document {} has been processed", documentId);
        } catch (Exception e){
            log.error(e.getMessage());
            documentEntity.setStatus(DocumentStatus.FAILED);
            documentRepository.save(documentEntity);
        }
    }
}
