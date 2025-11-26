#!/bin/bash
set -e

echo "=== Initializing CreativeHub project structure (docs + backend + ai-service) ==="

########################################
# 1. docs 目录 & Markdown 文档
########################################

mkdir -p docs

cat > docs/01-introduction.md << 'EOF'
# 01 - Project Introduction

CreativeHub 是一个集社区分享、多媒体处理、AI 辅助创作的创意平台。

主要功能：
- 图文 / 视频 / 攻略分享（类似小红书、小黑盒）
- 音乐相关工具：音频分离、AI 模仿人声等
- 摄影相关工具：AI 修图、调色
- 图片 + 音乐自动合成短视频

本目录用于记录项目的整体背景和目标。
EOF

cat > docs/02-architecture.md << 'EOF'
# 02 - System Architecture

本项目采用 Spring Cloud Alibaba 微服务架构，核心服务包括：

1. gateway-service      网关服务
2. auth-service         认证 / 登录 / 注册
3. user-post-service    用户 + 帖子 + 评论 + 点赞收藏关注
4. media-service        媒体上传与处理（图片/音频/视频）
5. ai-service (Python)  AI 模块：音频分离、AI 修图、人声克隆等
6. common               公共依赖模块

后端基础设施：
- Spring Boot 3.2.x
- Spring Cloud 2023.x
- Spring Cloud Alibaba 2023.0.1.0
- Nacos（服务注册 + 配置中心）
- Sentinel（限流 / 熔断）
- MQ（Kafka/RocketMQ，异步任务）
- MinIO（对象存储）
- Elasticsearch（搜索，可选）

EOF

cat > docs/03-services.md << 'EOF'
# 03 - Microservices Design

## 1. gateway-service
- 统一入口
- 路由转发
- JWT 解析
- 限流（配合 Sentinel）

## 2. auth-service
- 登录 / 注册
- JWT 签发与刷新
- Token 黑名单
- 登录时访问 user-post-service 获取用户信息

## 3. user-post-service
- 用户信息 / 角色 / 权限
- 帖子 / 攻略管理
- 评论 / 回复
- 点赞 / 收藏
- 关注 / 粉丝
- 简单 Feed 流（按时间 / 热度）

## 4. media-service
- 媒体上传（分片、秒传）
- 图片压缩、缩略图
- 视频转码、截图
- 音频处理（时长、波形）
- 任务入 MQ，交给 AI 服务处理

## 5. ai-service（Python）
- 音频分离（vocal / bgm）
- AI 模仿人声
- AI 修图 / 调色
- 可扩展更多模型

## 6. common 模块
- 公共工具
- Web 统一返回封装
- 安全 / JWT / 拦截器
- MQ 封装
- Feign 公共配置
EOF

cat > docs/04-database.md << 'EOF'
# 04 - Database Design

这里将设计各服务的数据库表结构，包括但不限于：

- 用户 & 权限：
  - user, user_profile, role, permission, user_role
- 社区：
  - post, post_content, tag, post_tag, comment, comment_reply
  - like_record, favorite, follow
- 媒体：
  - media_file, media_task, media_process_log

后续会在此文档中逐步补充字段设计和索引设计。
EOF

cat > docs/05-media-pipeline.md << 'EOF'
# 05 - Media Processing Pipeline

媒体处理流程说明：

1. 用户在前端发起上传（图片 / 视频 / 音频）
2. 通过 gateway 进入 media-service
3. media-service 负责：
   - 分片上传 / 秒传
   - 将原始文件存储到 MinIO
   - 写入 media_file 元数据
   - 发送处理任务到 MQ（例如：转码、截图、波形提取）
4. 异步消费者 / AI 服务处理完成后：
   - 更新 media_task 状态
   - 更新 media_file 信息
   - 将可用的访问 URL 返回给业务服务（如 user-post-service）

后续会在此文档中详细画出时序图与状态机。
EOF

cat > docs/06-ai-module.md << 'EOF'
# 06 - AI Module Design

## 音频相关
- 音频分离：使用 Demucs / Spleeter 等模型，将人声和伴奏分离
- 人声克隆：基于 RVC 等模型，生成“自己的声音唱歌”的音频

## 图像相关
- AI 修图：GFPGAN / Real-ESRGAN 等模型
- 风格迁移 / 调色：Stable Diffusion + ControlNet 等

## 服务形式
- 独立 Python 服务（FastAPI）
- 接收来自 media-service 或 user-post-service 的任务
- 处理完成后将结果写回 MinIO / DB

EOF

cat > docs/07-api-design.md << 'EOF'
# 07 - API Design

这里将编写各服务的 REST API 文档：
- 认证接口
- 用户接口
- 帖子 / 评论接口
- 媒体上传 / 查询接口
- AI 任务提交 / 查询接口

建议最终使用 Swagger/OpenAPI 生成在线文档。
EOF

cat > docs/08-dev-plan.md << 'EOF'
# 08 - Development Plan

建议开发顺序：
1. 初始化项目结构（当前步骤）
2. 搭建 Nacos + Gateway + auth-service 基本登录
3. 实现 user-post-service 的用户与发帖功能
4. 实现 media-service 的上传与基础处理（不带 AI）
5. 引入 MQ + AI 服务，打通媒体处理全链路
6. 增强：权限、限流、搜索、推荐等

这里可以记录每一阶段的任务拆分与里程碑。
EOF

cat > docs/99-changelog.md << 'EOF'
# 99 - Changelog

用于记录项目的重要变更。

- 初始化项目结构
EOF

echo "[OK] docs/ directory initialized."


########################################
# 2. backend（Spring Cloud Alibaba 父工程）
########################################

mkdir -p backend
cd backend

cat > pom.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">

    <modelVersion>4.0.0</modelVersion>

    <groupId>com.creativehub</groupId>
    <artifactId>creativehub-backend</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>pom</packaging>

    <name>CreativeHub Backend</name>
    <description>CreativeHub Spring Cloud Alibaba backend</description>

    <modules>
        <module>common</module>
        <module>gateway-service</module>
        <module>auth-service</module>
        <module>user-post-service</module>
        <module>media-service</module>
        <module>ai-service-client</module>
    </modules>

    <properties>
        <java.version>17</java.version>
        <spring.boot.version>3.2.4</spring.boot.version>
        <spring.cloud.version>2023.0.0</spring.cloud.version>
        <spring.cloud.alibaba.version>2023.0.1.0</spring.cloud.alibaba.version>
    </properties>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>${spring.boot.version}</version>
        <relativePath/>
    </parent>

    <dependencyManagement>
        <dependencies>
            <!-- Spring Cloud BOM -->
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring.cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>

            <!-- Spring Cloud Alibaba BOM -->
            <dependency>
                <groupId>com.alibaba.cloud</groupId>
                <artifactId>spring-cloud-alibaba-dependencies</artifactId>
                <version>${spring.cloud.alibaba.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <pluginManagement>
            <plugins>
                <plugin>
                    <groupId>org.springframework.boot</groupId>
                    <artifactId>spring-boot-maven-plugin</artifactId>
                </plugin>
            </plugins>
        </pluginManagement>
    </build>

</project>
EOF

echo "[OK] backend/pom.xml created."


########################################
# 3. common 聚合模块 + 子模块
########################################

mkdir -p common

cat > common/pom.xml << 'EOF'
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>com.creativehub</groupId>
        <artifactId>creativehub-backend</artifactId>
        <version>1.0.0-SNAPSHOT</version>
    </parent>

    <artifactId>common</artifactId>
    <packaging>pom</packaging>

    <modules>
        <module>common-core</module>
        <module>common-web</module>
        <module>common-security</module>
        <module>common-mq</module>
        <module>common-feign</module>
    </modules>
</project>
EOF

for module in common-core common-web common-security common-mq common-feign
do
  mkdir -p common/${module}/src/main/java
  mkdir -p common/${module}/src/main/resources
  cat > common/${module}/pom.xml << EOF
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>com.creativehub</groupId>
    <artifactId>common</artifactId>
    <version>1.0.0-SNAPSHOT</version>
  </parent>
  <artifactId>${module}</artifactId>
</project>
EOF
done

echo "[OK] common modules created."


########################################
# 4. 各 Java 微服务模块
########################################

# gateway-service
mkdir -p gateway-service/src/main/java/com/creativehub/gateway
mkdir -p gateway-service/src/main/resources

cat > gateway-service/pom.xml << 'EOF'
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>com.creativehub</groupId>
    <artifactId>creativehub-backend</artifactId>
    <version>1.0.0-SNAPSHOT</version>
  </parent>
  <artifactId>gateway-service</artifactId>

  <dependencies>
    <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-starter-gateway</artifactId>
    </dependency>
    <dependency>
      <groupId>com.alibaba.cloud</groupId>
      <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
    </dependency>
    <dependency>
      <groupId>com.alibaba.cloud</groupId>
      <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
  </dependencies>
</project>
EOF

cat > gateway-service/src/main/java/com/creativehub/gateway/GatewayServiceApplication.java << 'EOF'
package com.creativehub.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class GatewayServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(GatewayServiceApplication.class, args);
    }
}
EOF

cat > gateway-service/src/main/resources/application.yml << 'EOF'
server:
  port: 8000

spring:
  application:
    name: gateway-service
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
      config:
        server-addr: localhost:8848
    gateway:
      routes: []
EOF

echo "[OK] gateway-service created."


# 通用服务模板函数
create_service () {
  local svc=$1
  local pkg=$2
  local className=$3
  mkdir -p ${svc}/src/main/java/com/creativehub/${pkg}
  mkdir -p ${svc}/src/main/resources

  cat > ${svc}/pom.xml << EOF
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>com.creativehub</groupId>
    <artifactId>creativehub-backend</artifactId>
    <version>1.0.0-SNAPSHOT</version>
  </parent>
  <artifactId>${svc}</artifactId>

  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
      <groupId>com.alibaba.cloud</groupId>
      <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
    </dependency>
    <dependency>
      <groupId>com.alibaba.cloud</groupId>
      <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
    </dependency>
  </dependencies>
</project>
EOF

  cat > ${svc}/src/main/java/com/creativehub/${pkg}/${className}.java << EOF
package com.creativehub.${pkg};

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ${className} {
    public static void main(String[] args) {
        SpringApplication.run(${className}.class, args);
    }
}
EOF

  cat > ${svc}/src/main/resources/application.yml << EOF
spring:
  application:
    name: ${svc}
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
      config:
        server-addr: localhost:8848

server:
  port: 0  # 随机端口，后续自行调整
EOF
}

create_service "auth-service" "auth" "AuthServiceApplication"
create_service "user-post-service" "userpost" "UserPostServiceApplication"
create_service "media-service" "media" "MediaServiceApplication"
create_service "ai-service-client" "aiclient" "AiServiceClientApplication"

echo "[OK] auth/user-post/media/ai-service-client created."


########################################
# 5. ai-service (Python FastAPI 模块目录)
########################################

cd ..
mkdir -p ai-service

cat > ai-service/main.py << 'EOF'
from fastapi import FastAPI

app = FastAPI(title="CreativeHub AI Service")

@app.get("/health")
async def health():
    return {"status": "ok"}

# TODO:
# - /audio/separate
# - /audio/voice-clone
# - /image/enhance
# - /image/style-transfer

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=9000, reload=True)
EOF

cat > ai-service/README.md << 'EOF'
# CreativeHub AI Service

基于 FastAPI 的独立 AI 服务：
- 音频分离
- 人声克隆
- AI 修图 / 调色

由 Java 后端通过 HTTP/REST 调用。
EOF

echo "[OK] ai-service created."

echo "=== CreativeHub project structure initialized successfully! ==="
