USE stack_overflow_v2;

INSERT INTO tags(tagname, description, tagType, link, hasPilot, createdAt, updatedAt)
VALUES
("mci", "Ministry of Communications and Information", "AGENCY", "https://www.mci.gov.sg/contact-info", true, "2021-01-11 11:54:06", "2021-01-11 11:54:06"),
("mccy", "Ministry of Culture, Community, and Youth", "AGENCY", "https://www.mccy.gov.sg/contact-us", true, "2021-01-11 11:54:06", "2021-01-11 11:54:06"),
("ogp", "Open Government Products", "AGENCY", "https://open.gov.sg", true, "2021-01-11 11:54:06", "2021-01-11 11:54:06"),
("govtech", "Government Technology Agency", "AGENCY", "https://www.tech.gov.sg/", true, "2021-01-11 11:54:06", "2021-01-11 11:54:06");

INSERT INTO agencies(shortname, longname, logo, createdAt, updatedAt)
VALUES
("mci", "Ministry of Communications and Information", "https://s3-ap-southeast-1.amazonaws.com/logos.help.gov.sg/ogp.jpeg", "2021-01-11 11:54:06", "2021-01-11 11:54:06"),
("ogp", "open government products", "https://s3-ap-southeast-1.amazonaws.com/logos.help.gov.sg/ogp.jpeg", "2021-01-11 11:54:06", "2021-01-11 11:54:06"),
("govtech", "government technology", "https://s3-ap-southeast-1.amazonaws.com/logos.help.gov.sg/ogp.jpeg", "2021-01-11 11:54:06", "2021-01-11 11:54:06");

INSERT INTO users(username, views, createdAt, updatedAt, agencyId, displayname)
VALUES
("answerer@mci.gov.sg", 0, "2021-01-11 11:54:06", "2021-01-11 11:54:06", 1, "answerer"),
("viewer@mci.gov.sg", 0, "2021-01-11 11:54:06", "2021-01-11 11:54:06", 1, "viewer"),
("answerer@ogp.gov.sg", 0, "2021-01-11 11:54:06", "2021-01-11 11:54:06", 2, "answererOGP"),
("answerer2@ogp.gov.sg", 0, "2021-01-11 11:54:06", "2021-01-11 11:54:06", 2, "user2OGP");

INSERT INTO permissions(tagId, userId, role, createdAt, updatedAt)
VALUES
(1, 1, "answerer", "2021-01-11 11:54:06", "2021-01-11 11:54:06"),
(2, 1, "answerer", "2021-01-11 11:54:06", "2021-01-11 11:54:06"),
(3, 3, "answerer", "2021-01-11 11:54:06", "2021-01-11 11:54:06"),
(3, 4, "answerer", "2021-01-11 11:54:06", "2021-01-11 11:54:06");

-- FOR POST CREATION VIA SQL
-- INSERT INTO posts(id, title, description, views, status, createdAt, updatedAt, userId)
-- VALUES
-- (1,"asdf","hello", 2, "PUBLIC", "2021-01-11 11:54:06", "2021-01-11 11:54:06", 4);

-- INSERT INTO posttags(createdAt, updatedAt, postid, tagid)
-- VALUES
-- ("2021-01-11 11:54:06", "2021-01-11 11:54:06", 1, 2),
-- ("2021-01-11 11:54:06", "2021-01-11 11:54:06", 1, 1);
