# obtain class schedule data from classes.uwaterloo.ca

import mechanize
import json
from bs4 import BeautifulSoup

# declare explicit values for testing purposes
SUBJECT = 'MATH'
TERM = '1219'

# fill in form details for class schedule
br = mechanize.Browser()
br.open("https://classes.uwaterloo.ca/under.html")
br.select_form(action='/cgi-bin/cgiwrap/infocour/salook.pl')

br.find_control(name='sess').value = [TERM]
br.find_control(name='subject').value= [SUBJECT]

response = br.submit()
# response.read()

soup = BeautifulSoup(response.read(), 'html.parser')

# get main table for classes 
mainClassTable = soup.find('table', {'border': '2'})
# get iterator for children of main table
mainClassTableChildren = mainClassTable.findChildren("tr", recursive=False)

# initialize courses list
courses = []

# initialize course object
course = {}

for child in mainClassTableChildren:

    children = child.findChildren(recursive=False)
    print(children)
    
    # if tr is a header row, add course to classes and reinitialize the course object

    if children[0].name == 'th':
        courses += [course]
        try:
            print("Added course details for " + course['subjectCode'] + " " + course['catalogNumber'])
        except:
            print('error occurred when trying to print course details')
        course = {}

    # if tr is a course data row, add details to the course object
    elif children[0].name == 'td' and len(children) > 2:
        course['subjectCode'] = children[0].text
        course['catalogNumber'] = children[1].text
        course['units'] = children[2].text
        course['title'] = children[3].text

    # if tr is a course notes row, add notes to the current course object
    elif children[0].name == 'td' and len(children) == 1:
        course['notes'] = children[0].text

    # if tr is a course classes row, initialize classes list and iterate over the class table to 
    # add the classes to the course
    elif children[0].name == 'td' and len(children) == 2:
        course['classes'] = []
        print(children[1].text)
        class_soup = BeautifulSoup(children[1].text, 'html.parser')
        classTableRows = class_soup.find('table').find_all('tr')

        course['classes'] += ['eyy']

        for row in classTableRows:
            indiv_class_soup = BeautifulSoup(row, 'html.parser')
            # if table row is not a class (ie it is just headers or notes), we ignore it  
            # we do this by checking the first element of the table row's children, as that is the class number
            # if the number is not a number, it cannot be a class, so we can ignore it
            if indiv_class_soup.findChildren()[0].name == 'th' or not indiv_class_soup.findChildren()[0].text.isNumeric():
                continue

            # otherwise, the table row is a class, and so we add it to the classes list for the courses
            else:
                course['classes'] += [{
                    'classNumber': indiv_class_soup.findChildren()[0].text,
                    'section': indiv_class_soup.findChildren()[1].text,
                    'location': indiv_class_soup.findChildren()[2].text,
                    'enrolCap': indiv_class_soup.findChildren()[6].text,
                    'enrolTotal': indiv_class_soup.findChildren()[7].text,
                    'time': indiv_class_soup.findChildren()[10].text,
                    'location': indiv_class_soup.findChildren()[11].text,
                    'instructor': indiv_class_soup.findChildren()[12].text
                }]

    # otherwise, the tr is an undefined row, and we ignore it
    else:
        continue

courses += [course]

with open('data.json', 'w') as outfile:
    json.dump(courses, outfile)