# Auth Service Specification

## 功能
- 用户登录
- 用户注册
- Token 签发、刷新
- Token 黑名单

## 需要调用的外部服务
- user-post-service（注册/登录时查询用户）

## API 概述
- POST /auth/register
- POST /auth/login
- POST /auth/token/refresh
