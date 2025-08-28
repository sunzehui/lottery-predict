-- 双色球预测系统数据库结构

-- 创建数据库
CREATE DATABASE IF NOT EXISTS lottery CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lottery;

-- 开奖结果表
CREATE TABLE IF NOT EXISTS lottery_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  issue VARCHAR(10) NOT NULL COMMENT '期号',
  date DATE NOT NULL COMMENT '开奖日期',
  red_ball_1 TINYINT NOT NULL COMMENT '红球1',
  red_ball_2 TINYINT NOT NULL COMMENT '红球2',
  red_ball_3 TINYINT NOT NULL COMMENT '红球3',
  red_ball_4 TINYINT NOT NULL COMMENT '红球4',
  red_ball_5 TINYINT NOT NULL COMMENT '红球5',
  red_ball_6 TINYINT NOT NULL COMMENT '红球6',
  blue_ball TINYINT NOT NULL COMMENT '蓝球',
  prize_pool BIGINT DEFAULT 0 COMMENT '奖池金额(单位：分)',
  sales_amount BIGINT DEFAULT 0 COMMENT '销售额(单位：分)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_issue (issue),
  KEY idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='双色球开奖结果表';

-- 预测结果表
CREATE TABLE IF NOT EXISTS predictions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  issue VARCHAR(10) NOT NULL COMMENT '预测期号',
  predict_date DATE NOT NULL COMMENT '预测日期',
  red_ball_1 TINYINT NOT NULL COMMENT '预测红球1',
  red_ball_2 TINYINT NOT NULL COMMENT '预测红球2',
  red_ball_3 TINYINT NOT NULL COMMENT '预测红球3',
  red_ball_4 TINYINT NOT NULL COMMENT '预测红球4',
  red_ball_5 TINYINT NOT NULL COMMENT '预测红球5',
  red_ball_6 TINYINT NOT NULL COMMENT '预测红球6',
  blue_ball TINYINT NOT NULL COMMENT '预测蓝球',
  confidence DECIMAL(5,2) DEFAULT 0 COMMENT '置信度(0-100)',
  algorithm_type VARCHAR(50) DEFAULT 'mixed' COMMENT '算法类型(frequency/trend/coldHot/mixed)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_issue_algorithm (issue, algorithm_type),
  KEY idx_predict_date (predict_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='双色球预测结果表';

-- 预测结果评估表
CREATE TABLE IF NOT EXISTS prediction_evaluations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  prediction_id INT NOT NULL COMMENT '预测结果ID',
  red_hits TINYINT DEFAULT 0 COMMENT '红球命中数',
  blue_hit TINYINT DEFAULT 0 COMMENT '蓝球是否命中(0/1)',
  accuracy DECIMAL(5,2) DEFAULT 0 COMMENT '准确率(0-100)',
  evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prediction_id) REFERENCES predictions(id) ON DELETE CASCADE,
  UNIQUE KEY uk_prediction_id (prediction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='预测结果评估表';

-- 号码频率统计表
CREATE TABLE IF NOT EXISTS number_frequency (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ball_type ENUM('red', 'blue') NOT NULL COMMENT '球类型',
  ball_number TINYINT NOT NULL COMMENT '号码',
  frequency INT DEFAULT 0 COMMENT '出现次数',
  last_appearance_issue VARCHAR(10) DEFAULT NULL COMMENT '最后出现期号',
  last_appearance_date DATE DEFAULT NULL COMMENT '最后出现日期',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_ball_type_number (ball_type, ball_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='号码频率统计表';

-- 号码趋势表
CREATE TABLE IF NOT EXISTS number_trends (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ball_type ENUM('red', 'blue') NOT NULL COMMENT '球类型',
  ball_number TINYINT NOT NULL COMMENT '号码',
  issue VARCHAR(10) NOT NULL COMMENT '期号',
  trend_value DECIMAL(10,6) DEFAULT 0 COMMENT '趋势值',
  trend_type ENUM('up', 'down', 'stable') DEFAULT 'stable' COMMENT '趋势类型',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_ball_type_number (ball_type, ball_number),
  KEY idx_issue (issue)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='号码趋势表';

-- 系统配置表
CREATE TABLE IF NOT EXISTS system_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  config_key VARCHAR(50) NOT NULL COMMENT '配置键',
  config_value TEXT NOT NULL COMMENT '配置值',
  description VARCHAR(255) DEFAULT NULL COMMENT '配置描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_config_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- 数据获取日志表
CREATE TABLE IF NOT EXISTS data_fetch_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fetch_type ENUM('manual', 'auto') NOT NULL COMMENT '获取类型',
  start_issue VARCHAR(10) DEFAULT NULL COMMENT '开始期号',
  end_issue VARCHAR(10) DEFAULT NULL COMMENT '结束期号',
  records_added INT DEFAULT 0 COMMENT '新增记录数',
  records_updated INT DEFAULT 0 COMMENT '更新记录数',
  status ENUM('success', 'failed', 'partial') NOT NULL COMMENT '状态',
  error_message TEXT DEFAULT NULL COMMENT '错误信息',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_fetch_type (fetch_type),
  KEY idx_status (status),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据获取日志表';

-- 初始化系统配置数据
INSERT INTO system_config (config_key, config_value, description) VALUES
('data_source_url', 'https://www.cwl.gov.cn/cwl_admin/front/cwlkj/search/kjxx/findDrawNotice', '数据源URL'),
('auto_fetch_enabled', 'true', '是否启用自动获取数据'),
('auto_fetch_cron', '0 0 21 ? * TUE,THU,SUN', '自动获取数据cron表达式(每周二、四、日21点)'),
('max_history_issues', '100', '最大历史期数'),
('prediction_algorithm_weights', '{"frequency": 30, "trend": 25, "coldHot": 25, "combination": 20}', '预测算法权重配置'),
('hot_ball_threshold', '3', '热球阈值(近10期出现次数)'),
('cold_ball_threshold', '30', '冷球阈值(连续未出现期数)'),
('site_title', '双色球预测系统', '网站标题'),
('site_description', '基于历史数据分析的双色球预测系统', '网站描述');

-- 创建视图：开奖结果完整视图
CREATE VIEW vw_lottery_results AS
SELECT 
  id,
  issue,
  date,
  CONCAT(red_ball_1, ',', red_ball_2, ',', red_ball_3, ',', red_ball_4, ',', red_ball_5, ',', red_ball_6) AS red_balls,
  blue_ball,
  prize_pool / 100 AS prize_pool_yuan,
  sales_amount / 100 AS sales_amount_yuan,
  created_at,
  updated_at
FROM lottery_results;

-- 创建视图：预测结果完整视图
CREATE VIEW vw_predictions AS
SELECT 
  p.id,
  p.issue,
  p.predict_date,
  CONCAT(p.red_ball_1, ',', p.red_ball_2, ',', p.red_ball_3, ',', p.red_ball_4, ',', p.red_ball_5, ',', p.red_ball_6) AS red_balls,
  p.blue_ball,
  p.confidence,
  p.algorithm_type,
  CASE 
    WHEN pe.id IS NOT NULL THEN CONCAT(pe.red_hits, '红', IF(pe.blue_hit = 1, '+1蓝', '+0蓝'))
    ELSE '未开奖'
  END AS hit_result,
  CASE 
    WHEN pe.id IS NOT NULL THEN pe.accuracy
    ELSE NULL
  END AS accuracy,
  p.created_at,
  p.updated_at
FROM predictions p
LEFT JOIN prediction_evaluations pe ON p.id = pe.prediction_id;

-- 创建存储过程：更新号码频率统计
DELIMITER //
CREATE PROCEDURE UpdateNumberFrequency(IN p_issue VARCHAR(10))
BEGIN
  DECLARE v_date DATE;
  
  -- 获取开奖日期
  SELECT date INTO v_date FROM lottery_results WHERE issue = p_issue;
  
  -- 更新红球频率
  INSERT INTO number_frequency (ball_type, ball_number, frequency, last_appearance_issue, last_appearance_date)
  SELECT 'red', red_ball_1, 1, p_issue, v_date FROM lottery_results WHERE issue = p_issue
  ON DUPLICATE KEY UPDATE 
    frequency = frequency + 1,
    last_appearance_issue = p_issue,
    last_appearance_date = v_date;
    
  INSERT INTO number_frequency (ball_type, ball_number, frequency, last_appearance_issue, last_appearance_date)
  SELECT 'red', red_ball_2, 1, p_issue, v_date FROM lottery_results WHERE issue = p_issue
  ON DUPLICATE KEY UPDATE 
    frequency = frequency + 1,
    last_appearance_issue = p_issue,
    last_appearance_date = v_date;
    
  INSERT INTO number_frequency (ball_type, ball_number, frequency, last_appearance_issue, last_appearance_date)
  SELECT 'red', red_ball_3, 1, p_issue, v_date FROM lottery_results WHERE issue = p_issue
  ON DUPLICATE KEY UPDATE 
    frequency = frequency + 1,
    last_appearance_issue = p_issue,
    last_appearance_date = v_date;
    
  INSERT INTO number_frequency (ball_type, ball_number, frequency, last_appearance_issue, last_appearance_date)
  SELECT 'red', red_ball_4, 1, p_issue, v_date FROM lottery_results WHERE issue = p_issue
  ON DUPLICATE KEY UPDATE 
    frequency = frequency + 1,
    last_appearance_issue = p_issue,
    last_appearance_date = v_date;
    
  INSERT INTO number_frequency (ball_type, ball_number, frequency, last_appearance_issue, last_appearance_date)
  SELECT 'red', red_ball_5, 1, p_issue, v_date FROM lottery_results WHERE issue = p_issue
  ON DUPLICATE KEY UPDATE 
    frequency = frequency + 1,
    last_appearance_issue = p_issue,
    last_appearance_date = v_date;
    
  INSERT INTO number_frequency (ball_type, ball_number, frequency, last_appearance_issue, last_appearance_date)
  SELECT 'red', red_ball_6, 1, p_issue, v_date FROM lottery_results WHERE issue = p_issue
  ON DUPLICATE KEY UPDATE 
    frequency = frequency + 1,
    last_appearance_issue = p_issue,
    last_appearance_date = v_date;
    
  -- 更新蓝球频率
  INSERT INTO number_frequency (ball_type, ball_number, frequency, last_appearance_issue, last_appearance_date)
  SELECT 'blue', blue_ball, 1, p_issue, v_date FROM lottery_results WHERE issue = p_issue
  ON DUPLICATE KEY UPDATE 
    frequency = frequency + 1,
    last_appearance_issue = p_issue,
    last_appearance_date = v_date;
END //
DELIMITER ;

-- 创建存储过程：评估预测结果
DELIMITER //
CREATE PROCEDURE EvaluatePrediction(IN p_issue VARCHAR(10))
BEGIN
  DECLARE v_prediction_id INT;
  DECLARE v_red_hits INT;
  DECLARE v_blue_hit INT;
  DECLARE v_accuracy DECIMAL(5,2);
  
  -- 获取预测结果ID
  SELECT id INTO v_prediction_id FROM predictions WHERE issue = p_issue AND algorithm_type = 'mixed' LIMIT 1;
  
  IF v_prediction_id IS NOT NULL THEN
    -- 计算红球命中数
    SELECT 
      COUNT(*) INTO v_red_hits
    FROM lottery_results lr
    JOIN predictions p ON lr.issue = p.issue
    WHERE p.id = v_prediction_id
    AND (
      lr.red_ball_1 = p.red_ball_1 OR lr.red_ball_1 = p.red_ball_2 OR lr.red_ball_1 = p.red_ball_3 OR
      lr.red_ball_1 = p.red_ball_4 OR lr.red_ball_1 = p.red_ball_5 OR lr.red_ball_1 = p.red_ball_6 OR
      lr.red_ball_2 = p.red_ball_1 OR lr.red_ball_2 = p.red_ball_2 OR lr.red_ball_2 = p.red_ball_3 OR
      lr.red_ball_2 = p.red_ball_4 OR lr.red_ball_2 = p.red_ball_5 OR lr.red_ball_2 = p.red_ball_6 OR
      lr.red_ball_3 = p.red_ball_1 OR lr.red_ball_3 = p.red_ball_2 OR lr.red_ball_3 = p.red_ball_3 OR
      lr.red_ball_3 = p.red_ball_4 OR lr.red_ball_3 = p.red_ball_5 OR lr.red_ball_3 = p.red_ball_6 OR
      lr.red_ball_4 = p.red_ball_1 OR lr.red_ball_4 = p.red_ball_2 OR lr.red_ball_4 = p.red_ball_3 OR
      lr.red_ball_4 = p.red_ball_4 OR lr.red_ball_4 = p.red_ball_5 OR lr.red_ball_4 = p.red_ball_6 OR
      lr.red_ball_5 = p.red_ball_1 OR lr.red_ball_5 = p.red_ball_2 OR lr.red_ball_5 = p.red_ball_3 OR
      lr.red_ball_5 = p.red_ball_4 OR lr.red_ball_5 = p.red_ball_5 OR lr.red_ball_5 = p.red_ball_6 OR
      lr.red_ball_6 = p.red_ball_1 OR lr.red_ball_6 = p.red_ball_2 OR lr.red_ball_6 = p.red_ball_3 OR
      lr.red_ball_6 = p.red_ball_4 OR lr.red_ball_6 = p.red_ball_5 OR lr.red_ball_6 = p.red_ball_6
    );
    
    -- 计算蓝球是否命中
    SELECT 
      CASE WHEN lr.blue_ball = p.blue_ball THEN 1 ELSE 0 END INTO v_blue_hit
    FROM lottery_results lr
    JOIN predictions p ON lr.issue = p.issue
    WHERE p.id = v_prediction_id;
    
    -- 计算准确率
    SET v_accuracy = (v_red_hits * 16.67 + v_blue_hit * 16.67);
    
    -- 插入或更新评估结果
    INSERT INTO prediction_evaluations (prediction_id, red_hits, blue_hit, accuracy)
    VALUES (v_prediction_id, v_red_hits, v_blue_hit, v_accuracy)
    ON DUPLICATE KEY UPDATE 
      red_hits = v_red_hits,
      blue_hit = v_blue_hit,
      accuracy = v_accuracy;
  END IF;
END //
DELIMITER ;
