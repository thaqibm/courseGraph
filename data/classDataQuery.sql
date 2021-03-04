
USE class_data;

SELECT
    subjectCode,
    catalogNumber,
    courseId,
    SUM(termCode), -- this uniquely determines which seasons the course is offered in
    associatedAcademicGroupCode,
    associatedAcademicCareer,
    title,
    description,
    requirementsDescription
    courseComponentCode,
    enrollConsentCode,
    enrollConsentDescription,
    dropConsentCode,
    dropConsentDescription
FROM my_class_data2
GROUP BY subjectCode, catalogNumber
ORDER BY subjectCode, catalogNumber 
LIMIT 0, 20000;

-- SELECT * FROM my_class_data2
-- WHERE subjectCode = "ACTSC" AND catalogNumber = "291";
-- WHERE courseId = "011750";



