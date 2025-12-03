package com.creativehub.media.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RabbitMQ 配置类
 * 用于视频异步转码任务队列
 */
@Configuration
public class RabbitMqConfig {

    // 转码交换机
    public static final String TRANSCODE_EXCHANGE = "media.transcode.exchange";
    
    // 转码队列
    public static final String TRANSCODE_QUEUE = "media.transcode.queue";
    
    // 转码路由键
    public static final String TRANSCODE_ROUTING_KEY = "media.transcode";

    /**
     * 创建转码交换机（Direct类型）
     */
    @Bean
    public DirectExchange transcodeExchange() {
        return new DirectExchange(TRANSCODE_EXCHANGE, true, false);
    }

    /**
     * 创建转码队列（持久化）
     */
    @Bean
    public Queue transcodeQueue() {
        return new Queue(TRANSCODE_QUEUE, true);
    }

    /**
     * 绑定转码队列到交换机
     */
    @Bean
    public Binding transcodeBinding() {
        return BindingBuilder
            .bind(transcodeQueue())
            .to(transcodeExchange())
            .with(TRANSCODE_ROUTING_KEY);
    }

    /**
     * JSON 消息转换器
     */
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    /**
     * RabbitTemplate 配置
     */
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        template.setMandatory(true);
        return template;
    }

    /**
     * 监听器容器工厂配置
     */
    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(ConnectionFactory connectionFactory) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(jsonMessageConverter());
        factory.setConcurrentConsumers(2); // 并发消费者数量
        factory.setMaxConcurrentConsumers(5);
        return factory;
    }
}






