# obtain class schedule data from classes.uwaterloo.ca

import mechanize
from bs4 import BeautifulSoup

# fill in form details for class schedule
br = mechanize.Browser()
br.open("https://classes.uwaterloo.ca/under.html")
br.select_form(action='/cgi-bin/cgiwrap/infocour/salook.pl')

br.find_control(name='sess').value = ['1219']
br.find_control(name='subject').value=['MATH']

response = br.submit()
# response.read()

soup = BeautifulSoup(response.read(), 'html.parser')

print(soup.find_all('tr'))