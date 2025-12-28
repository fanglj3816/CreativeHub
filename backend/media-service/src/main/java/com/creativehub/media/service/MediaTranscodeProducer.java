package com.creativehub.media.service;

import com.creativehub.media.config.RabbitMqConfig;
import com.creativehub.media.dto.MediaTranscodeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

/**
 * 媒体转码任务生产者
 * 负责将转码任务发送到 RabbitMQ 队列
 */
@Service
public class MediaTranscodeProducer {

    private static final Logger log = LoggerFactory.getLogger(MediaTranscodeProducer.class);

    private final RabbitTemplate rabbitTemplate;

    public MediaTranscodeProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    /**
     * 发送转码任务到队列
     */
    public void sendTranscodeTask(MediaTranscodeMessage message) {
        try {
            rabbitTemplate.convertAndSend(
                RabbitMqConfig.TRANSCODE_EXCHANGE,
                RabbitMqConfig.TRANSCODE_ROUTING_KEY,
                message
            );
            log.info("Transcode task sent to queue: mediaId={}", message.getMediaId());
        } catch (Exception e) {
            log.error("Failed to send transcode task to queue: mediaId={}", message.getMediaId(), e);
            throw new RuntimeException("发送转码任务失败", e);
        }
    }
}














