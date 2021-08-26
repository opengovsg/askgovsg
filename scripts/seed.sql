USE askgov;

INSERT INTO `askgov`.`tags` (`id`, `tagname`, `description`, `link`, `hasPilot`, `createdAt`, `updatedAt`, `tagType`)
VALUES
(5, 'was', 'Work Allocation Singapore', 'https://www.was.gov.sg/', 1, NOW(), NOW(), 'AGENCY'),
(6, 'financial support', 'Financial Support', '', 0, NOW(), NOW(), 'TOPIC'),
(7, 'apprenticeships', 'Apprenticeships', '', 0, NOW(), NOW(), 'TOPIC'),
(8, 'employers', 'Employers', '', 0, NOW(), NOW(), 'TOPIC'),
(9, 'awards', 'Awards', '', 0, NOW(), NOW(), 'TOPIC')
;

INSERT INTO `askgov`.`agencies` (`id`, `shortname`, `longname`, `logo`, `email`, `createdAt`, `updatedAt`)
VALUES (4, 'was', 'Enquiries @ WAS', 'https://logos.ask.gov.sg/askgov-logo.svg', 'enquiries@was.gov.sg', '2021-01-11 11:54:06', '2021-01-11 11:54:06')
;

INSERT INTO `askgov`.`users` (`id`, `username`, `displayname`, `views`, `createdAt`, `updatedAt`, `agencyId`)
VALUES (4, 'enquiries@was.gov.sg', 'Work Allocation Singapore', 0, NOW(), NOW(), 4)
;

INSERT INTO `askgov`.`posts` (`id`, `title`, `description`, `status`, `createdAt`, `updatedAt`, `userId`)
VALUES
(14, "What financial support schemes are available at WAS?", '', 'PUBLIC', NOW(), NOW(), 4),
(15, "How do I apply for a WAS scheme?", '', 'PUBLIC', NOW(), NOW(), 4),
(16, "How long will my financial support scheme application take to process?", '', 'PUBLIC', NOW(), NOW(), 4),
(17, "How much is given out annually via WAS schemes?", '', 'PUBLIC', NOW(), NOW(), 4),
(18, "My application for financial support was rejected. Can I apply again?", '', 'PUBLIC', NOW(), NOW(), 4),

(19, "What other non-support financial programmes are run by WAS?", '', 'PUBLIC', NOW(), NOW(), 4),

(20, "Can I apply for the WAS Jobseeker Allowance and a WAS-sponsored apprenticeship at the same time?", 'I am currently unemployed and need as much financial support as possible. Can I apply for both the WAS Jobseeker Allowance and an apprenticeship sponsored by WAS at the same time?', 'PUBLIC', NOW(), NOW(), 4),

(21, "Which industry sectors have WAS-sponsored apprenticeships available?", '', 'PUBLIC', NOW(), NOW(), 4),
(22, "Why does WAS not provide apprenticeships across all of industry?", '', 'PUBLIC', NOW(), NOW(), 4),
(23, "How long can WAS-sponsored apprenticeships run for?", '', 'PUBLIC', NOW(), NOW(), 4),
(24, "What is the minimum stipend that is given to the apprentice?", '', 'PUBLIC', NOW(), NOW(), 4),
(25, "How can an appeal be made to WAS to consider apprenticeships in an industry sector?", 'I am a representative of my industry sector and would like WAS to consider sponsoring apprenticeships in my sector. How should I make an appeal to WAS to do this?', 'PUBLIC', NOW(), NOW(), 4),

(26, "How do I offer WAS-sponsored apprenticeships through my company?", 'I am an owner of a company, or a human resources officer with a company, and would like to offer WAS-sponsored apprenticeships. How do I do so?', 'PUBLIC', NOW(), NOW(), 4),
(27, "Can I offer more than the minimum stipend for WAS-sponsored apprenticeships?", '', 'PUBLIC', NOW(), NOW(), 4),
(28, "What kind of support can WAS provide to understaffed companies?", '', 'PUBLIC', NOW(), NOW(), 4),
(29, "How do I apply for a subsidy for robotics and automation?", '', 'PUBLIC', NOW(), NOW(), 4),
(30, "Can I apply for the National Creativity Award for work done as a government contractor?", '', 'PUBLIC', NOW(), NOW(), 4)
;

INSERT INTO `askgov`.`answers` (`postId`, `body`, `createdAt`, `updatedAt`, `userId`)
VALUES
(14, "WAS offers a Jobseeker Allowance Scheme and a Small Business Worker Income Support Package to help with the optimal allocation of work in Singapore.", NOW(), NOW(), 4),
(15, "Applicants may go to our official website to submit their applications via the relevant online forms.", NOW(), NOW(), 4),
(16, "Applications typically take 2-3 weeks to process. In cases with complex circumstances, applications may take up to a month.", NOW(), NOW(), 4),
(17, "WAS gives out about $120,000 annually through its financial support schemes. Most of it is through Jobseeker Allowances, with the rest providing Small Business Worker Income Support", NOW(), NOW(), 4),
(18, "Applicants are advised to allow for a period of about 3 months before making an application again.", NOW(), NOW(), 4),

(19, "WAS administers the National Creativity Award, which recognises innovations made in the course of government work.", NOW(), NOW(), 4),

(20, "We currently do not allow for applications for financial support and apprenticeship at the same time. This is to prevent overallocation of funds to individuals and to optimise allocation of work done in processing applications. We apologise for the inconvenience caused.", NOW(), NOW(), 4),

(21, "<p>WAS sponsors apprenticeships in sectors it identifies as in need of significant manpower. This currently includes:</p>\n<ul><li>Marine Engineering</li>\n<li>Nursing and Allied Professions</li>\n<li>Social Services</li></ul>", NOW(), NOW(), 4),
(22, "The Singapore Government has tasked WAS with the mandate of optimum allocation of work. To this end, its programmes and initiatives focus on directing people to industry sectors where the need for manpower is keenest.", NOW(), NOW(), 4),
(23, "WAS-sponsored apprenticeships should last no longer than 12 months. Beyond this period, the employer should consider converting the apprentice to a full-time employment.", NOW(), NOW(), 4),
(24, "The minimum stipend given to WAS-sponsored apprentices is means-tested annually and is $3000 as of 2021. 75% of this will be provided by WAS, with the remainder topped up by the employer.", NOW(), NOW(), 4),
(25, 'You may email us at <a href="mailto:industry.relations@was.gov.sg">industry.relations@was.gov.sg</a> to make a case for your industry sector to be considered.', NOW(), NOW(), 4),

(26, "Would-be employers may go to our official website to submit their applications via the relevant online forms.", NOW(), NOW(), 4),
(27, "An employer may offer more than the minimum stipend, however, any additional salary costs shall be borne solely by the employer.", NOW(), NOW(), 4),
(28, "<p>As part of its mission to optimise allocation of work in Singapore, WAS offers the following programmes to employers:</p>\n<ul><li>Apprenticeships</li>\n<li>Robotics and Automation Subsidies</li></ul>", NOW(), NOW(), 4),
(29, "Understaffed companies may go to our official website to submit their applications via the relevant online forms.", NOW(), NOW(), 4),
(30, "Applications for the National Creativity Award from non-government entities will be considered on a case-by-case basis.", NOW(), NOW(), 4)
;

INSERT INTO `askgov`.`permissions` (`role`, `createdAt`, `updatedAt`, `tagId`, `userId`)
VALUES
('answerer', NOW(), NOW(), 5, 4),
('answerer', NOW(), NOW(), 6, 4),
('answerer', NOW(), NOW(), 7, 4),
('answerer', NOW(), NOW(), 8, 4)
;

INSERT INTO `askgov`.`posttags` (`createdAt`, `updatedAt`, `postId`, `tagId`)
VALUES
(NOW(), NOW(), 14, 5),
(NOW(), NOW(), 14, 6),
(NOW(), NOW(), 15, 5),
(NOW(), NOW(), 15, 6),
(NOW(), NOW(), 16, 5),
(NOW(), NOW(), 16, 6),
(NOW(), NOW(), 17, 5),
(NOW(), NOW(), 17, 6),
(NOW(), NOW(), 18, 5),
(NOW(), NOW(), 18, 6),

(NOW(), NOW(), 19, 5),
(NOW(), NOW(), 19, 6),
(NOW(), NOW(), 19, 9),

(NOW(), NOW(), 20, 5),
(NOW(), NOW(), 20, 6),
(NOW(), NOW(), 20, 7),

(NOW(), NOW(), 21, 5),
(NOW(), NOW(), 21, 7),
(NOW(), NOW(), 22, 5),
(NOW(), NOW(), 22, 7),
(NOW(), NOW(), 23, 5),
(NOW(), NOW(), 23, 7),
(NOW(), NOW(), 24, 5),
(NOW(), NOW(), 24, 7),
(NOW(), NOW(), 25, 5),
(NOW(), NOW(), 25, 7),

(NOW(), NOW(), 26, 5),
(NOW(), NOW(), 26, 7),
(NOW(), NOW(), 26, 8),
(NOW(), NOW(), 27, 5),
(NOW(), NOW(), 27, 7),
(NOW(), NOW(), 27, 8),

(NOW(), NOW(), 28, 5),
(NOW(), NOW(), 28, 8),
(NOW(), NOW(), 29, 5),
(NOW(), NOW(), 29, 8),

(NOW(), NOW(), 30, 5),
(NOW(), NOW(), 30, 8),
(NOW(), NOW(), 30, 9)
;
