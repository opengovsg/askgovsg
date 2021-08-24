USE askgov;

ALTER TABLE answers
ADD expiration varchar(50) NOT NULL DEFAULT '6_MONTHS'; 