-- 创建 task 表
CREATE TABLE IF NOT EXISTS task (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id       BIGINT NOT NULL,
  task_type     VARCHAR(50) NOT NULL COMMENT 'AUDIO_VOCAL_SEPARATION',
  status        TINYINT NOT NULL COMMENT '0=待处理 1=处理中 2=成功 3=失败',
  progress      INT DEFAULT 0,
  input_file    VARCHAR(255) NOT NULL COMMENT 'MinIO 路径：audio/{userId}/{taskId}/input.mp3',
  result_json   TEXT COMMENT '{"vocal":"...","instrumental":"..."}',
  error_message VARCHAR(500),
  created_at    DATETIME,
  updated_at    DATETIME
);





