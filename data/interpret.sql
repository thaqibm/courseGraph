DROP TABLE my_class_data3; 
CREATE TABLE IF NOT EXISTS my_class_data3 (
subjectCode VARCHAR(10), 
catalogNumber VARCHAR(10), 
courseId VARCHAR(6), 
sumTermCode VARCHAR(4), 
title VARCHAR(255), 
courseDescription VARCHAR(4095), 
requirementsDescription VARCHAR(1023), 
courseComponentCode VARCHAR(15), 
associatedAcademicGroupCode VARCHAR(6), 
associatedAcademicCareer VARCHAR(6), 
enrollConsentCode VARCHAR(15), 
enrollConsentDescription VARCHAR(255), 
dropConsentCode VARCHAR(15), 
dropConsentDescription VARCHAR(255)
); 
INSERT INTO my_class_data3 
SELECT 
subjectCode, 
catalogNumber, 
courseId, 
SUM(termCode), 
title, 
courseDescription, 
requirementsDescription, 
courseComponentCode, 
associatedAcademicGroupCode, 
associatedAcademicCareer, 
enrollConsentCode, 
enrollConsentDescription, 
dropConsentCode, 
dropConsentDescription 
FROM my_class_data2 
GROUP BY subjectCode, catalogNumber 
ORDER BY subjectCode, catalogNumber; 