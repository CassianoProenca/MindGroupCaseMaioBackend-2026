ALTER TABLE `articles`
  ADD COLUMN `bookmarks_count` INTEGER NOT NULL DEFAULT 0;

CREATE TABLE `article_bookmarks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `article_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `article_bookmarks_article_id_user_id_key`(`article_id`, `user_id`),
    INDEX `article_bookmarks_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `article_bookmarks` ADD CONSTRAINT `article_bookmarks_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `article_bookmarks` ADD CONSTRAINT `article_bookmarks_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
