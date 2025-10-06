-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `name` VARCHAR(255) NULL,
    `assemble_user_id` VARCHAR(512) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted_at` TIMESTAMP(0) NULL,

    INDEX `idx_users_deleted_at`(`deleted_at`),
    INDEX `idx_su_id_deleted_covering`(`id`, `deleted_at`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `authentication` (
    `id` CHAR(36) NOT NULL DEFAULT (uuid()),
    `user_id` CHAR(36) NOT NULL,
    `username` VARCHAR(255) NOT NULL UNIQUE,
    `secret` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deleted_at` TIMESTAMP(0) NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `fk_authentication_user_id`
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
