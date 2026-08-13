package com.classsync.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@SuppressWarnings("null")
public class SseService {
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public SseEmitter addEmitter() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.add(emitter);
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        try { 
            emitter.send(SseEmitter.event().name("connected").data("{}")); 
        } catch (Exception e) { 
            emitters.remove(emitter); 
        }
        return emitter;
    }

    public void broadcast(String eventName, Object payload) {
        for (SseEmitter emitter : emitters) {
            try { 
                emitter.send(SseEmitter.event().name(eventName).data(payload)); 
            } catch (Exception e) { 
                emitters.remove(emitter); 
            }
        }
    }
}