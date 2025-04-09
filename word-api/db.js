const mysql = require("mysql");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "word_flash_card"
});

module.exports = db;

/*
CREATE DATABASE word_flash_card;
USE word_flash_card;

CREATE TABLE CARD (
 card_id int auto_increment primary key,
 card_front varchar(1000) not null,
 card_back varchar(4000) not null,
 memorized_count int default 0,
 wrong_count int default 0,
 created_at datetime default current_timestamp
);
ALTER TABLE CARD ADD is_deleted BOOL DEFAULT FALSE;

CREATE TABLE TAG (
 tag_id int auto_increment primary key,
 name varchar(100) unique not null
);

CREATE TABLE CARD_TAG (
 card_id int not null,
 tag_id int not null,
 primary key (card_id, tag_id),
 foreign key (card_id) references CARD(card_id) on delete cascade,
 foreign key (tag_id) references TAG(tag_id) on delete cascade
);

INSERT INTO CARD(card_front, card_back)
VALUES 
('格差', '（かくさ）	격차	所得格差 = 소득 격차');

INSERT INTO TAG (name) VALUES ('사회'), ('정치');

INSERT INTO CARD_TAG (card_id, tag_id)
VALUES (1, 1);

select * from CARD;
select * from TAG;
select * from CARD_TAG;
*/