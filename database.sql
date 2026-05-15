CREATE DATABASE IF NOT EXISTS mind_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE mind_blog;

DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL,
  UNIQUE KEY users_email_key (email),
  PRIMARY KEY (id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE articles (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(180) NOT NULL,
  content TEXT NOT NULL,
  banner_image LONGBLOB NULL,
  banner_mime_type VARCHAR(80) NULL,
  author_id INT NOT NULL,
  published_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL,
  INDEX articles_author_id_idx (author_id),
  PRIMARY KEY (id),
  CONSTRAINT articles_author_id_fkey FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO users (id, name, email, password_hash, created_at, updated_at) VALUES
  (1, 'Cassiano Proenca', 'cassiano@example.com', '$2b$10$ZWoUaao5FbSATsh7sjD8decylbaGc3BMIrQF8Om32QfhAPDDFRYcK', NOW(3), NOW(3));

INSERT INTO articles (title, content, banner_image, banner_mime_type, author_id, published_at, updated_at) VALUES
  (
    'Como um blog aproxima produto e comunidade',
    'Um blog bem estruturado ajuda a registrar novidades, bastidores e aprendizados de um produto. Neste primeiro artigo, a proposta e mostrar uma API simples, segura e preparada para integracao com o frontend.',
    UNHEX('89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000A49444154789C6360000002000100FFFF03000006000557BFAB5D0000000049454E44AE426082'),
    'image/png',
    1,
    NOW(3),
    NOW(3)
  ),
  (
    'Autenticacao e conteudo sob controle',
    'Criar, editar e remover artigos exige login, enquanto leitura e listagem seguem publicas. Esse desenho atende o minimo do case e deixa a experiencia simples para usuarios e avaliadores.',
    UNHEX('89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000A49444154789C6360000002000100FFFF03000006000557BFAB5D0000000049454E44AE426082'),
    'image/png',
    1,
    NOW(3),
    NOW(3)
  );
