#!/bin/bash
set -e

echo "=== Updating CreativeHub Project (with admin-service) ==="

# Create backend admin-service directory
mkdir -p backend/admin-service/src/main/java
mkdir -p backend/admin-service/src/main/resources

# Create admin-service pom.xml
cat > backend/admin-service/pom.xml << 'EOF'
<project xmlns="http://maven.apache.org/POM/4.0.0" 
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
                      http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <parent>
    <groupId>com.creativehub</groupId>
    <artifactId>backend</artifactId>
    <version>1.0-SNAPSHOT</version>
  </parent>

  <artifactId>admin-service</artifactId>
  <name>admin-service</name>

  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-starter-openfeign</artifactId>
    </dependency>
  </dependencies>

</project>
EOF

# Update parent POM if exists
if [ -f backend/pom.xml ]; then
  if ! grep -q "admin-service" backend/pom.xml; then
    sed -i '' '/<modules>/a\
        <module>admin-service</module>' backend/pom.xml
  fi
fi

# Update docs
mkdir -p docs/04-service-specifications
mkdir -p docs/06-api-design

cat > docs/04-service-specifications/admin-service.md << 'EOF'
# Admin Service Specification

## 功能
- 用户管理（封禁、角色调整）
- 内容管理（删除违规内容）
- 媒体管理（审核、重试处理)
- AI 任务管理（重试、失败监控)
- 系统监控（未来可扩展 Prometheus)

## 外部服务调用
- user-post-service
- media-service
- ai-service-client
- auth-service

EOF

cat > docs/06-api-design/admin-api.md << 'EOF'
# Admin API

## 用户管理
- GET /admin/user/list
- POST /admin/user/ban
- POST /admin/user/role/update

## 内容管理
- GET /admin/post/list
- POST /admin/post/delete

## 媒体管理
- GET /admin/media/list
- POST /admin/media/reprocess

## AI 任务管理
- GET /admin/ai/task/list
- POST /admin/ai/task/retry

EOF

echo "=== Done ==="
