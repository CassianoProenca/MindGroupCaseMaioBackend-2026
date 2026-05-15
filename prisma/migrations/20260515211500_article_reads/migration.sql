CREATE TABLE `article_reads` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `article_id` INTEGER NOT NULL,
  `user_id` INTEGER NULL,
  `reader_id` VARCHAR(80) NOT NULL,
  `duration_seconds` INTEGER NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `article_reads_article_id_idx`(`article_id`),
  INDEX `article_reads_user_id_idx`(`user_id`),
  INDEX `article_reads_reader_id_idx`(`reader_id`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `article_reads`
  ADD CONSTRAINT `article_reads_article_id_fkey`
  FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `article_reads`
  ADD CONSTRAINT `article_reads_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
