USE askgov;

ALTER TABLE posts
ADD status varchar(50) NOT NULL DEFAULT "PUBLIC";