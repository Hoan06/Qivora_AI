package project_backend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;
import org.springframework.web.multipart.MultipartFile;
import project_backend.exception.BadRequestException;
import project_backend.model.entity.Document;
import project_backend.model.entity.User;
import project_backend.model.enum_entity.DocumentStatus;
import project_backend.repository.DocumentRepository;
import project_backend.security.principle.CustomUserDetails;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class IngestService {
    private final DocumentRepository documentRepository;
    private final AsyncIngestProcessor asyncIngestProcessor;
    private final CloudinaryService cloudinaryService;

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(".pdf", ".docx", ".doc", ".txt", ".md");

    public String ingestDocument(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Tài liệu tải lên không được để trống!");
        }

        String originalFilename = (file.getOriginalFilename() != null) ? file.getOriginalFilename() : "document.txt";

        String fileExtension = "";
        int lastDotIndex = originalFilename.lastIndexOf('.');
        if (lastDotIndex > 0) {
            fileExtension = originalFilename.substring(lastDotIndex).toLowerCase();
        }
        if (!ALLOWED_EXTENSIONS.contains(fileExtension)) {
            throw new BadRequestException("Định dạng file không được hỗ trợ. Chỉ chấp nhận: " + ALLOWED_EXTENSIONS);
        }

        byte[] fileBytes = file.getBytes();

        String hash = DigestUtils.md5DigestAsHex(fileBytes);

        // Kiểm tra trùng hash (cho phép nạp lại nếu lần trước bị FAILED)
        Optional<Document> existingDocOpt = documentRepository.findByFileHash(hash);
        if (existingDocOpt.isPresent()) {
            Document existingDoc = existingDocOpt.get();
            if (existingDoc.getStatus() == DocumentStatus.COMPLETED || existingDoc.getStatus() == DocumentStatus.PROCESSING) {
                throw new BadRequestException("Tài liệu này đã tồn tại trong hệ thống (trùng Hash)!");
            }
            documentRepository.delete(existingDoc);
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new BadRequestException("Không xác định được danh tính người dùng!");
        }
        User currentUser = userDetails.getUser();

        String documentUrl = null;
        try {
            documentUrl = cloudinaryService.uploadDocument(file);
        } catch (Exception e) {
            log.warn("Không thể tải tài liệu lên Cloudinary: {}", e.getMessage());
        }

        Document document = Document.builder()
                .name(originalFilename)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .fileHash(hash)
                .status(DocumentStatus.PROCESSING)
                .link_document(documentUrl)
                .user(currentUser)
                .is_active(true)
                .build();

        Document savedDocument = documentRepository.save(document);

        // 8. Đóng gói ByteArrayResource an toàn cho luồng @Async
        Resource safeResource = new ByteArrayResource(fileBytes) {
            @Override
            public String getFilename() {
                return originalFilename;
            }
        };

        asyncIngestProcessor.processIngestDocument(savedDocument.getId(), safeResource);

        return "Tài liệu đã được tiếp nhận và đang tiến hành xử lý nạp dữ liệu (ID: " + savedDocument.getId() + ")";
    }
}
