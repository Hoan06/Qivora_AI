package project_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project_backend.model.dto.request.ChatRequest;
import project_backend.model.dto.response.ApiDataResponse;
import project_backend.model.dto.response.ChatResponse;
import project_backend.service.impl.RagChatService;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {
    private final RagChatService ragChatService;

    @PostMapping("/message")
    public ResponseEntity<ApiDataResponse<ChatResponse>> sendMessage(@Valid @RequestBody ChatRequest request) {
        String reply = ragChatService.chatWithContext(request.getMessage(), request.getConversationId());
        return ResponseEntity.ok(new ApiDataResponse<>(
                true,
                "Nhận phản hồi từ trợ lý ảo thành công.",
                new ChatResponse(reply, request.getConversationId()),
                null,
                HttpStatus.OK
        ));
    }
}
