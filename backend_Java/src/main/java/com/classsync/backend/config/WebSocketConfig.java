package com.classsync.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Client သို့ ပြန်လည် Broadcast လုပ်မည့် Prefix
        config.enableSimpleBroker("/topic", "/queue");
        // Client မှ Message စတင်ပေးပို့မည့် Prefix
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // SockJS ဖြင့် ချိတ်ဆက်ရန် Endpoint
        registry.addEndpoint("/ws-chat")
                .setAllowedOriginPatterns("*")
                .setAllowedOrigins("https://classsync-portal.vercel.app", "http://localhost:5173")
                .withSockJS();

        // SockJS မသုံးလိုဘဲ Pure WebSocket ဖြင့် ချိတ်ဆက်ရန် Endpoint (Option)
        registry.addEndpoint("/ws-chat")
                .setAllowedOriginPatterns("*")
                .setAllowedOrigins("https://classsync-portal.vercel.app", "http://localhost:5173");
    }
}