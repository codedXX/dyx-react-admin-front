package com.admin.controller;

import com.admin.entity.ChatMessage;
import com.admin.mapper.ChatMessageMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * WebSocket聊天控制器
 */
@Controller
public class ChatController {
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private ChatMessageMapper chatMessageMapper;
    
    /**
     * 接收并广播聊天消息
     */
    @MessageMapping("/chat/send")
    @SendTo("/topic/messages")
    public Map<String, Object> sendMessage(Map<String, Object> message) {
        // 保存消息到数据库（可选）
        try {
            ChatMessage chatMessage = new ChatMessage();
            chatMessage.setSenderId(1L); // 简化处理，实际应从token获取
            chatMessage.setMessage(message.get("text").toString());
            chatMessage.setSendTime(LocalDateTime.now());
            chatMessageMapper.insert(chatMessage);
        } catch (Exception e) {
            System.out.println("保存消息失败：" + e.getMessage());
        }
        
        // 返回消息给所有订阅者
        Map<String, Object> response = new HashMap<>();
        response.put("id", System.currentTimeMillis());
        response.put("text", message.get("text"));
        // 使用前端传来的sender,而不是硬编码为"other"
        response.put("sender", message.get("sender"));
        response.put("timestamp", message.get("timestamp"));
        
        return response;
    }
    
    /**
     * 测试WebSocket连接
     */
    @GetMapping("/api/chat/test")
    @ResponseBody
    public String testChat() {
        return "WebSocket服务正常运行";
    }
}
