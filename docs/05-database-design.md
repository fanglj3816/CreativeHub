# Database Design

## ER 图（ASCII 简化）

```
User --< Post --< Comment
  |        |
  |        ---> MediaFile
  |
  ---> Follow
```

## 核心表
- user
- user_profile
- post
- post_content
- comment
- like_record
- favorite
- follow
- media_file
- media_task
