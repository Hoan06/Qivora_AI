package project_backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project_backend.model.dto.response.DocumentResponse;
import project_backend.model.dto.response.PageResponse;
import project_backend.model.entity.Document;
import project_backend.repository.DocumentRepository;
import project_backend.service.DocumentService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {
    private final DocumentRepository documentRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<DocumentResponse> getDocuments(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);
        Page<Document> documentPage = documentRepository.findAll(
                PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "id"))
        );
        return PageResponse.<DocumentResponse>builder()
                .content(documentPage.getContent().stream().map(this::toResponse).toList())
                .page(documentPage.getNumber())
                .size(documentPage.getSize())
                .totalElements(documentPage.getTotalElements())
                .totalPages(documentPage.getTotalPages())
                .first(documentPage.isFirst())
                .last(documentPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentResponse> getAllDocuments() {
        return documentRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Document getDocumentById(long id) {
        return documentRepository.findById(id).orElse(null);
    }


    private DocumentResponse toResponse(Document doc) {
        return DocumentResponse.builder()
                .id(doc.getId())
                .name(doc.getName())
                .fileType(doc.getFileType())
                .fileSize(doc.getFileSize())
                .status(doc.getStatus())
                .chunkCount(doc.getChunkCount())
                .isActive(doc.getIs_active())
                .createdAt(doc.getCreated_at())
                .linkDocument(doc.getLink_document())
                .uploaderId(doc.getUser() != null ? doc.getUser().getId() : null)
                .uploaderUsername(doc.getUser() != null ? doc.getUser().getUsername() : null)
                .build();
    }
}
