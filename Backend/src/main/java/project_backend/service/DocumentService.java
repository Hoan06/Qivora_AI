package project_backend.service;

import project_backend.model.dto.response.DocumentResponse;
import project_backend.model.dto.response.PageResponse;
import project_backend.model.entity.Document;

import java.util.List;

public interface DocumentService {
    PageResponse<DocumentResponse> getDocuments(int page, int size);

    List<DocumentResponse> getAllDocuments();
    Document getDocumentById(long id);
}
