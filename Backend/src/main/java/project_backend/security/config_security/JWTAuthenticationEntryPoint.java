package project_backend.security.config_security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import com.fasterxml.jackson.databind.ObjectMapper;


import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

public class JWTAuthenticationEntryPoint implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException, ServletException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");

        Map<String, Object> errors = new TreeMap<>();
        errors.put("error", HttpServletResponse.SC_UNAUTHORIZED);
        errors.put("message", "Tài khoản chưa được xác thực !");
        errors.put("path", request.getServletPath());

        ObjectMapper mapper = new ObjectMapper();
        response.getWriter().println(mapper.writeValueAsString(errors));
    }
}
