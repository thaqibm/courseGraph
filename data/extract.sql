USE class_data;

-- CREATE TABLE courseComponentCodes (
-- 	cccode VARCHAR(10)
-- );

-- CREATE TABLE associatedAcademicGroupCodes (
-- 	aagcode VARCHAR(10)
-- );

-- CREATE TABLE associatedAcademicCareers (
-- 	aacareer VARCHAR(10)
-- );

-- INSERT INTO courseComponentCodes
-- SELECT courseComponentCode FROM my_class_data3
-- GROUP BY courseComponentCode;

-- INSERT INTO associatedAcademicGroupCodes
-- SELECT associatedAcademicGroupCode FROM my_class_data3
-- GROUP BY associatedAcademicGroupCode;

-- INSERT INTO associatedAcademicCareers
-- SELECT associatedAcademicCareer FROM my_class_data3
-- GROUP BY associatedAcademicCareer;

SELECT cccode FROM courseComponentCodes;
SELECT aagcode FROM associatedAcademicGroupCodes;
SELECT aacareer FROM associatedAcademicCareers;