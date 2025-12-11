package com.creativehub.aiclient.config;

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
 * 注意：音频分离功能已改为使用线程池异步调用 Python 服务，不再使用 MQ
 * 以下音频分离相关的 MQ 配置已注释，但保留通用配置供其他功能使用
 */
@Configuration
public class RabbitMqConfig {

    // ========== 音频分离相关 MQ 配置（已停用） ==========
    // 音频分离功能已改为使用线程池异步调用 Python 服务
    // 以下配置已注释，如需重新启用 MQ 方案，可取消注释
    
    /*
    // 音频分离交换机
    public static final String AUDIO_SEPARATION_EXCHANGE = "audio.separation.exchange";
    
    // 音频分离队列
    public static final String AUDIO_SEPARATION_QUEUE = "audio.separation.queue";
    
    // 音频分离路由键
    public static final String AUDIO_SEPARATION_ROUTING_KEY = "audio.separation";

    // 创建音频分离交换机（Direct类型）
    @Bean
    public DirectExchange audioSeparationExchange() {
        return new DirectExchange(AUDIO_SEPARATION_EXCHANGE, true, false);
    }

    // 创建音频分离队列（持久化）
    @Bean
    public Queue audioSeparationQueue() {
        return new Queue(AUDIO_SEPARATION_QUEUE, true);
    }

    // 绑定音频分离队列到交换机
    @Bean
    public Binding audioSeparationBinding() {
        return BindingBuilder
            .bind(audioSeparationQueue())
            .to(audioSeparationExchange())
            .with(AUDIO_SEPARATION_ROUTING_KEY);
    }
    */

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


