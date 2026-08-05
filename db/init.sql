-- ============================================================================
--  微信小程序点菜系统 — MySQL 初始化脚本
--  字符集: utf8mb4 / 引擎: InnoDB
--  用法:
--    1) 本地建库:  CREATE DATABASE order_sys DEFAULT CHARACTER SET utf8mb4;
--    2) 执行本文件: mysql -u root -p order_sys < db/init.sql
--  说明:
--    * 本脚本是建表的唯一依据(Sequelize 模型与之保持一致)。
--    * 默认管理员账号 admin / admin123 由 server/scripts/seed.js 写入(bcrypt 加密),
--      这里不硬编码 password_hash。下方 users 表会插入示例小程序用户/管理员用于联调。
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- users: 小程序用户 + Web 管理员(共用一张表,靠 role / openid / username 区分)
--   - openid     : 小程序用户有(微信), 纯 Web 管理员为 NULL
--   - username   : Web 管理员登录账号, 小程序用户为 NULL
--   - status     : active / disabled —— disabled 表示被禁用登录
--   - role       : user 普通用户 / admin 管理员(可在小程序里看到所有人的订单)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `dishes`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `openid`        VARCHAR(64)  DEFAULT NULL COMMENT '微信 openid',
  `nickname`      VARCHAR(64)  DEFAULT NULL,
  `avatar_url`    VARCHAR(512) DEFAULT NULL,
  `phone`         VARCHAR(20)  DEFAULT NULL,
  `role`          ENUM('user','admin') NOT NULL DEFAULT 'user',
  `username`      VARCHAR(64)  DEFAULT NULL COMMENT 'Web 管理员登录账号',
  `password_hash` VARCHAR(255) DEFAULT NULL COMMENT 'Web 管理员密码(bcrypt)',
  `status`        ENUM('active','disabled') NOT NULL DEFAULT 'active',
  `session_key`   VARCHAR(128) DEFAULT NULL COMMENT '微信 session_key',
  `last_login_at` DATETIME     DEFAULT NULL,
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid`   (`openid`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户(小程序+管理员)';

-- ----------------------------------------------------------------------------
-- categories: 菜品分类
-- ----------------------------------------------------------------------------
CREATE TABLE `categories` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(64)  NOT NULL,
  `icon`       VARCHAR(255) DEFAULT NULL,
  `sort_order` INT          NOT NULL DEFAULT 0,
  `status`     TINYINT      NOT NULL DEFAULT 1 COMMENT '1上架 0下架',
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜品分类';

-- ----------------------------------------------------------------------------
-- dishes: 菜品(无库存字段;数量属于订单 order_items)
--   属性: 名称 name / 简介 description / 做法 cooking_method / 分类 category_id
-- ----------------------------------------------------------------------------
CREATE TABLE `dishes` (
  `id`              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id`     INT UNSIGNED NOT NULL,
  `name`            VARCHAR(128) NOT NULL,
  `description`     VARCHAR(512) DEFAULT NULL COMMENT '简介',
  `cooking_method`  VARCHAR(128) DEFAULT NULL COMMENT '做法',
  `calories`        INT UNSIGNED DEFAULT NULL COMMENT '热量(千卡)',
  `image_url`       VARCHAR(512) DEFAULT NULL,
  `status`          TINYINT      NOT NULL DEFAULT 1 COMMENT '1在售 0停售',
  `sort_order`      INT          NOT NULL DEFAULT 0,
  `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category_id`),
  CONSTRAINT `fk_dishes_category` FOREIGN KEY (`category_id`)
    REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜品';

-- ----------------------------------------------------------------------------
-- orders: 订单
-- ----------------------------------------------------------------------------
CREATE TABLE `orders` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_no`   VARCHAR(32)  NOT NULL COMMENT '业务单号',
  `user_id`    INT UNSIGNED NOT NULL,
  `status`     ENUM('pending','preparing','served','cancelled') NOT NULL DEFAULT 'pending',
  `remark`     VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `order_date` DATE         NOT NULL COMMENT '下单日期(便于按天统计)',
  `item_count` INT          NOT NULL DEFAULT 0 COMMENT '总份数',
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_user`      (`user_id`),
  KEY `idx_order_date` (`order_date`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单';

-- ----------------------------------------------------------------------------
-- order_items: 订单明细(快照菜名/做法,菜品后续编辑或删除不影响历史)
--   quantity = 本单点了该菜几份(即"数量")
-- ----------------------------------------------------------------------------
CREATE TABLE `order_items` (
  `id`              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id`        INT UNSIGNED NOT NULL,
  `dish_id`         INT UNSIGNED DEFAULT NULL,
  `dish_name`       VARCHAR(128) NOT NULL COMMENT '下单时的菜名快照',
  `cooking_method`  VARCHAR(128) DEFAULT NULL COMMENT '下单时的做法快照',
  `quantity`        INT          NOT NULL DEFAULT 1 COMMENT '点了多少份',
  `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order` (`order_id`),
  CONSTRAINT `fk_items_order` FOREIGN KEY (`order_id`)
    REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_items_dish` FOREIGN KEY (`dish_id`)
    REFERENCES `dishes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单明细';

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
--  示例数据
-- ============================================================================

-- 分类
INSERT INTO `categories` (`name`, `icon`, `sort_order`, `status`) VALUES
  ('热菜',   '🔥', 1, 1),
  ('凉菜',   '🥗', 2, 1),
  ('汤煲',   '🍲', 3, 1),
  ('主食',   '🍚', 4, 1),
  ('饮品',   '🥤', 5, 1);

-- 菜品(category_id 对应上面分类的 1..5;calories 单位千卡,可空)
INSERT INTO `dishes` (`category_id`, `name`, `description`, `cooking_method`, `calories`, `image_url`, `status`, `sort_order`) VALUES
  (1, '红烧肉',     '肥而不腻、入口即化的经典本帮菜',     '红烧',   350, NULL, 1, 1),
  (1, '宫保鸡丁',   '花生与鸡丁的香辣组合',               '爆炒',   280, NULL, 1, 2),
  (1, '水煮牛肉',   '麻辣鲜香、牛肉嫩滑',                 '水煮',   320, NULL, 1, 3),
  (2, '凉拌黄瓜',   '清爽开胃的餐前小菜',                 '凉拌',    60, NULL, 1, 1),
  (2, '口水鸡',     '麻辣红油浇头,鲜嫩鸡腿肉',           '凉拌',   220, NULL, 1, 2),
  (3, '番茄鸡蛋汤', '家常暖汤',                           '煮汤',    90, NULL, 1, 1),
  (3, '酸萝卜老鸭汤','酸香浓郁、滋阴润燥',                '炖汤',   180, NULL, 1, 2),
  (4, '蛋炒饭',     '粒粒分明的经典炒饭',                 '炒',     400, NULL, 1, 1),
  (4, '兰州拉面',   '手工拉制、汤清面韧',                 '煮',     450, NULL, 1, 2),
  (5, '柠檬冰红茶', '清凉解腻',                           '冷饮',   120, NULL, 1, 1),
  (5, '热豆浆',     '现磨暖胃',                           '热饮',    80, NULL, 1, 2);

-- ============================================================================
--  示例小程序用户(用于演示 Web 管理端的用户列表 / 订单)
--  说明: openid 形如 mock_openid_xxx 是开发期 mock-login 用的;真实环境由微信下发。
-- ============================================================================
INSERT INTO `users` (`openid`, `nickname`, `avatar_url`, `role`, `status`) VALUES
  ('mock_openid_alice', '小爱', NULL, 'user', 'active'),
  ('mock_openid_bob',   '小博', NULL, 'user', 'active');

-- 示例订单(放在今天,便于"今日订单"立即看到数据)
INSERT INTO `orders` (`order_no`, `user_id`, `status`, `remark`, `order_date`, `item_count`) VALUES
  (CONCAT('OD', DATE_FORMAT(NOW(), '%Y%m%d'), '001'), 1, 'served',     '少辣',     CURDATE(), 2),
  (CONCAT('OD', DATE_FORMAT(NOW(), '%Y%m%d'), '002'), 2, 'preparing',  NULL,       CURDATE(), 1);

INSERT INTO `order_items` (`order_id`, `dish_id`, `dish_name`, `cooking_method`, `quantity`) VALUES
  (1, 1, '红烧肉', '红烧', 1),
  (1, 8, '蛋炒饭', '炒',   1),
  (2, 5, '口水鸡', '凉拌', 1);

-- ============================================================================
--  默认管理员账号 (username=admin, password=admin123)
--  ✅ 不在本 SQL 里硬编码 password_hash,而是由 server/scripts/seed.js 用 bcrypt 写入。
--     安装依赖后执行:  cd server && npm run seed
-- ============================================================================
