USE stack_overflow_v2;

ALTER TABLE posts
ADD status varchar(50) NOT NULL DEFAULT "PUBLIC";