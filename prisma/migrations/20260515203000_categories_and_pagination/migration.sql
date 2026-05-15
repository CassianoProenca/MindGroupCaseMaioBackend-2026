CREATE TABLE `categories` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `slug` VARCHAR(140) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,

  UNIQUE INDEX `categories_name_key`(`name`),
  UNIQUE INDEX `categories_slug_key`(`slug`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `articles` ADD COLUMN `category_id` INTEGER NULL;

INSERT INTO `categories` (`name`, `slug`, `updated_at`)
SELECT DISTINCT
  TRIM(`category`) AS `name`,
  LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(TRIM(`category`), ' ', '-'), '/', '-'), '.', ''), ',', ''), '--', '-')) AS `slug`,
  CURRENT_TIMESTAMP(3) AS `updated_at`
FROM `articles`
WHERE `category` IS NOT NULL AND TRIM(`category`) <> '';

UPDATE `articles`
INNER JOIN `categories` ON `categories`.`name` = TRIM(`articles`.`category`)
SET `articles`.`category_id` = `categories`.`id`
WHERE `articles`.`category` IS NOT NULL AND TRIM(`articles`.`category`) <> '';

ALTER TABLE `articles` DROP COLUMN `category`;

CREATE INDEX `articles_category_id_idx` ON `articles`(`category_id`);

ALTER TABLE `articles`
  ADD CONSTRAINT `articles_category_id_fkey`
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
