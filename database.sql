CREATE DATABASE IF NOT EXISTS mind_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE mind_blog;

DROP TABLE IF EXISTS article_likes;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS article_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  bio TEXT NULL,
  avatar_url VARCHAR(500) NULL,
  role VARCHAR(40) NOT NULL DEFAULT 'AUTHOR',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL,
  UNIQUE KEY users_email_key (email),
  PRIMARY KEY (id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE articles (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(180) NOT NULL,
  summary VARCHAR(280) NULL,
  content TEXT NOT NULL,
  category VARCHAR(120) NULL,
  banner_image LONGBLOB NULL,
  banner_mime_type VARCHAR(80) NULL,
  views_count INT NOT NULL DEFAULT 0,
  likes_count INT NOT NULL DEFAULT 0,
  author_id INT NOT NULL,
  published_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL,
  INDEX articles_author_id_idx (author_id),
  PRIMARY KEY (id),
  CONSTRAINT articles_author_id_fkey FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE tags (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(80) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY tags_name_key (name),
  PRIMARY KEY (id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE article_tags (
  article_id INT NOT NULL,
  tag_id INT NOT NULL,
  INDEX article_tags_tag_id_idx (tag_id),
  PRIMARY KEY (article_id, tag_id),
  CONSTRAINT article_tags_article_id_fkey FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT article_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE comments (
  id INT NOT NULL AUTO_INCREMENT,
  content TEXT NOT NULL,
  article_id INT NOT NULL,
  author_id INT NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL,
  INDEX comments_article_id_idx (article_id),
  INDEX comments_author_id_idx (author_id),
  PRIMARY KEY (id),
  CONSTRAINT comments_article_id_fkey FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE article_likes (
  id INT NOT NULL AUTO_INCREMENT,
  article_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY article_likes_article_id_user_id_key (article_id, user_id),
  INDEX article_likes_user_id_idx (user_id),
  PRIMARY KEY (id),
  CONSTRAINT article_likes_article_id_fkey FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT article_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO users (id, name, email, password_hash, bio, avatar_url, role, created_at, updated_at) VALUES
  (1, 'Cassiano Proenca', 'cassiano@example.com', '$2b$10$ZWoUaao5FbSATsh7sjD8decylbaGc3BMIrQF8Om32QfhAPDDFRYcK', 'Desenvolvedor Full Stack apaixonado por tecnologia e inovacao.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e', 'ADMIN', NOW(3), NOW(3));

INSERT INTO articles (id, title, summary, content, category, banner_image, banner_mime_type, views_count, likes_count, author_id, published_at, updated_at) VALUES
  (
    1,
    'Como um blog aproxima produto e comunidade',
    'Uma visao pratica de como conteudo tecnico fortalece produto, marca e comunidade.',
    'Um blog bem estruturado ajuda a registrar novidades, bastidores e aprendizados de um produto. Neste primeiro artigo, a proposta e mostrar uma API simples, segura e preparada para integracao com o frontend.',
    'Desenvolvimento web',
    UNHEX('89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000A49444154789C6360000002000100FFFF03000006000557BFAB5D0000000049454E44AE426082'),
    'image/png',
    122,
    1,
    1,
    NOW(3),
    NOW(3)
  ),
  (
    2,
    'Autenticacao e conteudo sob controle',
    'Login, permissoes e autoria para manter a publicacao segura sem pesar na experiencia.',
    'Criar, editar e remover artigos exige login, enquanto leitura e listagem seguem publicas. Esse desenho atende o minimo do case e deixa a experiencia simples para usuarios e avaliadores.',
    'Desenvolvimento backend',
    UNHEX('89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000A49444154789C6360000002000100FFFF03000006000557BFAB5D0000000049454E44AE426082'),
    'image/png',
    84,
    2,
    1,
    NOW(3),
    NOW(3)
  );

INSERT INTO tags (id, name, created_at) VALUES
  (1, 'Typescript', NOW(3)),
  (2, 'Backend', NOW(3)),
  (3, 'Produto', NOW(3)),
  (4, 'Autenticacao', NOW(3)),
  (5, 'JWT', NOW(3)),
  (6, 'Express', NOW(3));

INSERT INTO article_tags (article_id, tag_id) VALUES
  (1, 1),
  (1, 2),
  (1, 3),
  (2, 4),
  (2, 5),
  (2, 6);

INSERT INTO comments (content, article_id, author_id, created_at, updated_at) VALUES
  ('Excelente artigo! Muito bem explicado sobre as decisoes tecnicas do projeto.', 1, 1, NOW(3), NOW(3)),
  ('Gostei da separacao entre leitura publica e escrita autenticada.', 1, 1, NOW(3), NOW(3));
