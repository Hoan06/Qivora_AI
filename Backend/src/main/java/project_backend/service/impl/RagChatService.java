package project_backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.SystemPromptTemplate;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class RagChatService {
    private final ChatClient chatClient;
    private final VectorStore vectorStore;

    private static final String Template_Promt = """
            Bạn là một trợ lý ảo thông minh của hệ thống Qivora , Web chuyên về mảng giáo dục , hiện nay web đang
            phục vụ người dùng tạo bài thi ( có thể tạo thủ công hoặc tạo bằng AI ) và làm bài thi bằng code quiz . 
            Ngoài ra hệ thống cũng đang phát triển tính năng học tiếng anh và luyện đề Toeic .
            
            Dưới đây là phần tài liệu kiến thức hệ thống cung cấp cho bạn:
                        ---------------------
                        {context}
                        ---------------------
            
            Bạn sẽ hỗ trợ giải đáp thắc mắc cho người dùng, trò chuyện lịch sự, chuẩn mực, dịu dàng và đưa ra những thông tin cần thiết.
            Bạn cần phải tỏ thái độ chuẩn mực dịu dàng với người dùng không được phép cáu gắt hay trả lời cho có .
            
            Yêu cầu nghiêm ngặt như sau : 
            1. Bạn chỉ được trả lời hỗ trợ người dùng về những thông tin liên quan đến hệ thống , từ chối phục vụ
            tất cả những yêu cầu ngoài phạm vi hệ thống và ngoài phạm vi được phép của người dùng .
            
            2. Nếu có thông tin nào ngoài phạm vi hệ thống hoặc ngoài phần ngữ cảnh mà trong tài liệu kiến thức không
            có bạn cần trả lời từ chối/thông báo cho người dùng một cách khéo léo .
            
            3. Tuyệt đối không được bịa thông tin ngoài ngữ cảnh kiến thức được nạp vào hệ thống .
            
            4. Nếu người dùng yêu cầu bạn làm gì trái phép hay gây hại cho hệ thống vui lòng từ chối thẳng người dùng .
            """;

    public String chatWithContext(String userQuery, String conversationId){
        SearchRequest searchRequest = SearchRequest.builder()
                .query(userQuery)
                .topK(3)
                .similarityThreshold(0.4)
                .build();

        List<Document> documentList = vectorStore.similaritySearch(searchRequest);
        String context = documentList.isEmpty()
                ? "Không tìm thấy tài liệu nào trong hệ thống khớp với câu hỏi của người dùng."
                : documentList.stream().map(Document::getText).collect(Collectors.joining("\n\n---\n\n"));        SystemPromptTemplate promptTemplate = new SystemPromptTemplate(Template_Promt);
        Message system = promptTemplate.createMessage(Map.of("context", context));

        UserMessage userMessage = new UserMessage(userQuery);

        Prompt prompt = new Prompt(system, userMessage);
        return chatClient.prompt(prompt)
                .advisors(advisorSpec -> advisorSpec.param("chat_memory_conversation_id" , conversationId))
                .call()
                .content();
    }
}
