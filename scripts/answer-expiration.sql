USE stack_overflow_v2;

ALTER TABLE answers
ADD expiration varchar(50) NOT NULL DEFAULT '6_MONTHS'; 