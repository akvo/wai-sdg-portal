```python
import pandas as pd
import numpy as np
from openpyxl import load_workbook
from IPython.core.display import display, HTML
from pathlib import Path

```


```python
css_rules = Path('dataframe.css').read_text()
HTML('<style>' + css_rules + '</style>')
```




<style>/* title of columns */
table {
  width: 100%;
  display: table !important;
  min-width: 100%;
}
table.dataframe thead th {
  font-size: .8em !important;
  padding-top: 0.2em !important;
  padding-bottom: 0.2em !important;
}

/* title of rows */
table.dataframe tbody th {
  font-size: .8em !important;
  text-align: right;
  vertical-align: top;
}

/* style for each cell */
table.dataframe td {
  font-size: .8em !important;
  text-align: right;
  vertical-align: top;
}

/* disable zebra-style */
table.dataframe tbody tr {
  background: white !important;
}

/* row color on hover */
table.dataframe tbody tr:hover {
  background: rgba(43, 137, 226, 0.144) !important;
}

/* Settings for slides */

.present table.dataframe thead th {
  font-size: 1.5em !important;
}

.present table.dataframe tbody th {
  font-size: 1.5em !important;
}

.present table.dataframe td {
  font-size: 1.3em !important;
  vertical-align: top !important;
}

.present table.dataframe thead th {
  border-bottom: none !important;
  padding-top: 0.1em !important;
  padding-bottom: 0.1em !important;
}
</style>




```python
source = './data-input.xlsx'
source_filter = 'Eth'
```


```python
def get_definitions(data, form_name, location):
    forms = []
    for index, col in enumerate(list(data)):
        datatype = data[col].dtypes
        formtype = "text"
        options = None
        if datatype == int:
            formtype = "number"
        if datatype == np.float64:
            formtype = "decimal"
        if datatype == object:
            test = data[col].dropna()
            test = test.str.capitalize()
            options = list(test.unique())
            if len(options) > 8:
                options = None
                formtype = "text"
            else:
                formtype = "option"
        if col in location:
            options = None
            formtype = "cascade"
        cname = col.replace("_"," ").title()
        if "|" in cname:
            cname = cname.split("|")[1]
        if formtype == "option":
            for opt in options:
                forms.append({"ID": index + 1,"QUESTION": cname, "TYPE": formtype.upper(), "OPTIONS": opt})
        else:
            forms.append({"ID":  index + 1, "QUESTION": cname, "TYPE": formtype.upper(), "OPTIONS": " - "})
    display(HTML(f"<h1>{form_name}</h1>"))
    display(HTML(pd.DataFrame(forms).groupby(['ID','QUESTION','TYPE','OPTIONS']).first().to_html()))
    display(HTML(f"<hr/>"))
```


```python
all_sheets = load_workbook(source, read_only=True).sheetnames
sheets = list(filter(lambda x: 'Eth' in x, all_sheets))

for sheet in sheets:
    data = pd.read_excel(source, sheet)
    data.drop(data.filter(regex="Unnamed"),axis=1, inplace=True)
    get_definitions(data, sheet, ["Woreda","Kebele"])
```


<h1>Eth HH</h1>



<table border="1" class="dataframe">
  <thead>
    <tr>
      <th>ID</th>
      <th>QUESTION</th>
      <th>TYPE</th>
      <th>OPTIONS</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>1</th>
      <th>Woreda</th>
      <th>CASCADE</th>
      <th>-</th>
    </tr>
    <tr>
      <th>2</th>
      <th>Kebele</th>
      <th>CASCADE</th>
      <th>-</th>
    </tr>
    <tr>
      <th>3</th>
      <th>Village</th>
      <th>TEXT</th>
      <th>-</th>
    </tr>
    <tr>
      <th>4</th>
      <th>Name Of Respondent</th>
      <th>TEXT</th>
      <th>-</th>
    </tr>
    <tr>
      <th>5</th>
      <th>Household Size</th>
      <th>NUMBER</th>
      <th>-</th>
    </tr>
    <tr>
      <th>6</th>
      <th>Main Source Of Drinking Water</th>
      <th>TEXT</th>
      <th>-</th>
    </tr>
    <tr>
      <th rowspan="4" valign="top">7</th>
      <th rowspan="4" valign="top">Water Service Level</th>
      <th rowspan="4" valign="top">OPTION</th>
      <th>Basic</th>
    </tr>
    <tr>
      <th>Limited</th>
    </tr>
    <tr>
      <th>Surface water</th>
    </tr>
    <tr>
      <th>Unimproved</th>
    </tr>
    <tr>
      <th rowspan="3" valign="top">8</th>
      <th rowspan="3" valign="top">Specific Location Of Water Collection</th>
      <th rowspan="3" valign="top">OPTION</th>
      <th>Elsewhere</th>
    </tr>
    <tr>
      <th>In own dwelling</th>
    </tr>
    <tr>
      <th>In own yard / plot</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">9</th>
      <th rowspan="2" valign="top">Time To Collect Water</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>Less than 30 minutes</th>
    </tr>
    <tr>
      <th>More than 30 minutes</th>
    </tr>
    <tr>
      <th rowspan="3" valign="top">10</th>
      <th rowspan="3" valign="top">Times In Last Month When Drinking Water Quantity Was Insufficient</th>
      <th rowspan="3" valign="top">OPTION</th>
      <th>Don't know</th>
    </tr>
    <tr>
      <th>No, always sufficient</th>
    </tr>
    <tr>
      <th>Yes, at least once</th>
    </tr>
    <tr>
      <th rowspan="4" valign="top">11</th>
      <th rowspan="4" valign="top">Sanitation Service Level</th>
      <th rowspan="4" valign="top">OPTION</th>
      <th>Basic</th>
    </tr>
    <tr>
      <th>Limited</th>
    </tr>
    <tr>
      <th>Safely managed</th>
    </tr>
    <tr>
      <th>Unimproved</th>
    </tr>
    <tr>
      <th rowspan="8" valign="top">12</th>
      <th rowspan="8" valign="top">Type Of Toilet Facility</th>
      <th rowspan="8" valign="top">OPTION</th>
      <th>Bucket</th>
    </tr>
    <tr>
      <th>Pit latrine with slab</th>
    </tr>
    <tr>
      <th>Pit latrine without slab/open pit</th>
    </tr>
    <tr>
      <th>There is no latrine</th>
    </tr>
    <tr>
      <th>Toilet that flush/pour to flush piped sewer system</th>
    </tr>
    <tr>
      <th>Toilet that flush/pour to pit latrine</th>
    </tr>
    <tr>
      <th>Twinpit offset latrine</th>
    </tr>
    <tr>
      <th>Ventilated improved pit latrine (vip)</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">13</th>
      <th rowspan="2" valign="top">Facility Is Shared With Others Outside Of The Household</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>No</th>
    </tr>
    <tr>
      <th>Yes</th>
    </tr>
    <tr>
      <th rowspan="3" valign="top">14</th>
      <th rowspan="3" valign="top">Location Of Sanitation Facility</th>
      <th rowspan="3" valign="top">OPTION</th>
      <th>Elsewhere</th>
    </tr>
    <tr>
      <th>In own dwelling</th>
    </tr>
    <tr>
      <th>In own plot/yard</th>
    </tr>
    <tr>
      <th rowspan="3" valign="top">15</th>
      <th rowspan="3" valign="top">Emptying Of On-Site Sanitation Facilities</th>
      <th rowspan="3" valign="top">OPTION</th>
      <th>Don't know</th>
    </tr>
    <tr>
      <th>No, never emptied</th>
    </tr>
    <tr>
      <th>Yes, but don't know when</th>
    </tr>
    <tr>
      <th rowspan="3" valign="top">16</th>
      <th rowspan="3" valign="top">Hygiene Service Level</th>
      <th rowspan="3" valign="top">OPTION</th>
      <th>Basic</th>
    </tr>
    <tr>
      <th>Limited</th>
    </tr>
    <tr>
      <th>No facility</th>
    </tr>
    <tr>
      <th rowspan="5" valign="top">17</th>
      <th rowspan="5" valign="top">Type Of Handwashing Facility Used Most Often</th>
      <th rowspan="5" valign="top">OPTION</th>
      <th>Fixed facility observed in dwelling</th>
    </tr>
    <tr>
      <th>Fixed facility observed in plot/yard</th>
    </tr>
    <tr>
      <th>Mobile object observed (bucket, jug, kettle)</th>
    </tr>
    <tr>
      <th>No handwashing place available in dwelling/plot/yard</th>
    </tr>
    <tr>
      <th>No permission to see</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">18</th>
      <th rowspan="2" valign="top">Water Available At Handwashing Facility</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>Water is available</th>
    </tr>
    <tr>
      <th>Water is not available</th>
    </tr>
    <tr>
      <th rowspan="3" valign="top">19</th>
      <th rowspan="3" valign="top">Soap Is Available</th>
      <th rowspan="3" valign="top">OPTION</th>
      <th>Ash/mud/sand is present</th>
    </tr>
    <tr>
      <th>No, not present</th>
    </tr>
    <tr>
      <th>Yes, soap or detergent are present</th>
    </tr>
  </tbody>
</table>



<hr/>



<h1>Eth Health</h1>



<table border="1" class="dataframe">
  <thead>
    <tr>
      <th>ID</th>
      <th>QUESTION</th>
      <th>TYPE</th>
      <th>OPTIONS</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>1</th>
      <th>Woreda</th>
      <th>CASCADE</th>
      <th>-</th>
    </tr>
    <tr>
      <th>2</th>
      <th>Kebele</th>
      <th>CASCADE</th>
      <th>-</th>
    </tr>
    <tr>
      <th>3</th>
      <th>Name Of Health Facility</th>
      <th>TEXT</th>
      <th>-</th>
    </tr>
    <tr>
      <th>4</th>
      <th>Latitude</th>
      <th>DECIMAL</th>
      <th>-</th>
    </tr>
    <tr>
      <th>5</th>
      <th>Longitude</th>
      <th>DECIMAL</th>
      <th>-</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">6</th>
      <th rowspan="2" valign="top">Type Of Healthy Facility</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>Health post</th>
    </tr>
    <tr>
      <th>Other</th>
    </tr>
    <tr>
      <th rowspan="4" valign="top">7</th>
      <th rowspan="4" valign="top">Description Of Water Supply In Health Facilities</th>
      <th rowspan="4" valign="top">OPTION</th>
      <th>No water supply in premises</th>
    </tr>
    <tr>
      <th>Pipeline connections</th>
    </tr>
    <tr>
      <th>Protected wells</th>
    </tr>
    <tr>
      <th>Rain water harvesting</th>
    </tr>
    <tr>
      <th rowspan="3" valign="top">8</th>
      <th rowspan="3" valign="top">Water</th>
      <th rowspan="3" valign="top">OPTION</th>
      <th>Basic</th>
    </tr>
    <tr>
      <th>Limited</th>
    </tr>
    <tr>
      <th>No service</th>
    </tr>
    <tr>
      <th rowspan="3" valign="top">9</th>
      <th rowspan="3" valign="top">Latrine Description</th>
      <th rowspan="3" valign="top">OPTION</th>
      <th>No latrine</th>
    </tr>
    <tr>
      <th>Simple pit latrine</th>
    </tr>
    <tr>
      <th>Vip</th>
    </tr>
    <tr>
      <th rowspan="3" valign="top">10</th>
      <th rowspan="3" valign="top">Sanitation</th>
      <th rowspan="3" valign="top">OPTION</th>
      <th>Limited</th>
    </tr>
    <tr>
      <th>No service</th>
    </tr>
    <tr>
      <th>Usable</th>
    </tr>
    <tr>
      <th>11</th>
      <th>Physically Separate Latrines For Male Female Patients</th>
      <th>OPTION</th>
      <th>No</th>
    </tr>
    <tr>
      <th>12</th>
      <th>Facilitated Access For Disabled</th>
      <th>OPTION</th>
      <th>No</th>
    </tr>
    <tr>
      <th rowspan="3" valign="top">13</th>
      <th rowspan="3" valign="top">Latrine Condition</th>
      <th rowspan="3" valign="top">OPTION</th>
      <th>Clean, used</th>
    </tr>
    <tr>
      <th>Dirty but used</th>
    </tr>
    <tr>
      <th>Filthy ,unused</th>
    </tr>
    <tr>
      <th>14</th>
      <th>Is There Hand Washing Facility With In 5M Of The Toilet</th>
      <th>OPTION</th>
      <th>No facility</th>
    </tr>
    <tr>
      <th>15</th>
      <th>Hygiene</th>
      <th>OPTION</th>
      <th>No service</th>
    </tr>
    <tr>
      <th>16</th>
      <th>Is Hand Washing Facility Operating I.E With Water</th>
      <th>OPTION</th>
      <th>Yes</th>
    </tr>
    <tr>
      <th>17</th>
      <th>Is Soap Available At Each Hand Washing Stand</th>
      <th>OPTION</th>
      <th>No</th>
    </tr>
    <tr>
      <th>18</th>
      <th>Is There A Toilet For Staff</th>
      <th>OPTION</th>
      <th>No</th>
    </tr>
  </tbody>
</table>



<hr/>



<h1>Eth School</h1>



<table border="1" class="dataframe">
  <thead>
    <tr>
      <th>ID</th>
      <th>QUESTION</th>
      <th>TYPE</th>
      <th>OPTIONS</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>1</th>
      <th>Woreda</th>
      <th>CASCADE</th>
      <th>-</th>
    </tr>
    <tr>
      <th>2</th>
      <th>Kebele</th>
      <th>CASCADE</th>
      <th>-</th>
    </tr>
    <tr>
      <th>3</th>
      <th>School Name</th>
      <th>TEXT</th>
      <th>-</th>
    </tr>
    <tr>
      <th>4</th>
      <th>Latitude</th>
      <th>DECIMAL</th>
      <th>-</th>
    </tr>
    <tr>
      <th>5</th>
      <th>Longitude</th>
      <th>DECIMAL</th>
      <th>-</th>
    </tr>
    <tr>
      <th rowspan="3" valign="top">6</th>
      <th rowspan="3" valign="top">School Type</th>
      <th rowspan="3" valign="top">OPTION</th>
      <th>High school 9-10</th>
    </tr>
    <tr>
      <th>Primary(1-4)</th>
    </tr>
    <tr>
      <th>Primary(1-8)</th>
    </tr>
    <tr>
      <th>7</th>
      <th>Male Pupils</th>
      <th>NUMBER</th>
      <th>-</th>
    </tr>
    <tr>
      <th>8</th>
      <th>Female Pupils</th>
      <th>DECIMAL</th>
      <th>-</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">9</th>
      <th rowspan="2" valign="top">Reason For Inventory</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>New scheme</th>
    </tr>
    <tr>
      <th>Repair</th>
    </tr>
    <tr>
      <th rowspan="4" valign="top">10</th>
      <th rowspan="4" valign="top">Water Supply Source</th>
      <th rowspan="4" valign="top">OPTION</th>
      <th>No water scheme</th>
    </tr>
    <tr>
      <th>No water supply in premises</th>
    </tr>
    <tr>
      <th>Pipeline connection</th>
    </tr>
    <tr>
      <th>Shallow well fitted with pump</th>
    </tr>
    <tr>
      <th rowspan="3" valign="top">11</th>
      <th rowspan="3" valign="top">Water</th>
      <th rowspan="3" valign="top">OPTION</th>
      <th>Basic</th>
    </tr>
    <tr>
      <th>Limited</th>
    </tr>
    <tr>
      <th>No service</th>
    </tr>
    <tr>
      <th>12</th>
      <th>Year Commisioned</th>
      <th>DECIMAL</th>
      <th>-</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">13</th>
      <th rowspan="2" valign="top">Functionality Status Of Water Supply</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>Functional</th>
    </tr>
    <tr>
      <th>Non functional - mechanical</th>
    </tr>
    <tr>
      <th>14</th>
      <th>Yield</th>
      <th>DECIMAL</th>
      <th>-</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">15</th>
      <th rowspan="2" valign="top">Type Of Latrine</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>No latrine</th>
    </tr>
    <tr>
      <th>Simple pit latrine</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">16</th>
      <th rowspan="2" valign="top">Sanitation</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>Limited</th>
    </tr>
    <tr>
      <th>No service</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">17</th>
      <th rowspan="2" valign="top">Latrine For Boys And Girls Separate</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>No</th>
    </tr>
    <tr>
      <th>Yes</th>
    </tr>
    <tr>
      <th>18</th>
      <th>Number Of Boy Pupils</th>
      <th>NUMBER</th>
      <th>-</th>
    </tr>
    <tr>
      <th>19</th>
      <th>Number Of Girl Pupils</th>
      <th>DECIMAL</th>
      <th>-</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">20</th>
      <th rowspan="2" valign="top">Are There Latrines For Disabled?</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>No</th>
    </tr>
    <tr>
      <th>Yes</th>
    </tr>
    <tr>
      <th rowspan="3" valign="top">21</th>
      <th rowspan="3" valign="top">Latrine Condition</th>
      <th rowspan="3" valign="top">OPTION</th>
      <th>Clean, used</th>
    </tr>
    <tr>
      <th>Dirty but used</th>
    </tr>
    <tr>
      <th>No latrine</th>
    </tr>
    <tr>
      <th>22</th>
      <th>Hygiene Service Level</th>
      <th>OPTION</th>
      <th>No service</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">23</th>
      <th rowspan="2" valign="top">Presence Of Handwashingfacility</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>No</th>
    </tr>
    <tr>
      <th>Yes</th>
    </tr>
    <tr>
      <th>24</th>
      <th>Hand Washing In Use</th>
      <th>OPTION</th>
      <th>No</th>
    </tr>
    <tr>
      <th>25</th>
      <th>Availability Of Soap</th>
      <th>OPTION</th>
      <th>No</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">26</th>
      <th rowspan="2" valign="top">Urinal Present Girls</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>No</th>
    </tr>
    <tr>
      <th>Yes</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">27</th>
      <th rowspan="2" valign="top">Urinal Present Boys</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>No</th>
    </tr>
    <tr>
      <th>Yes</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">28</th>
      <th rowspan="2" valign="top">Separate Latrine For Tolitet Staff</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>No</th>
    </tr>
    <tr>
      <th>Yes</th>
    </tr>
  </tbody>
</table>



<hr/>



<h1>Eth WP</h1>



<table border="1" class="dataframe">
  <thead>
    <tr>
      <th>ID</th>
      <th>QUESTION</th>
      <th>TYPE</th>
      <th>OPTIONS</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>1</th>
      <th>Woreda</th>
      <th>CASCADE</th>
      <th>-</th>
    </tr>
    <tr>
      <th>2</th>
      <th>Kebele</th>
      <th>CASCADE</th>
      <th>-</th>
    </tr>
    <tr>
      <th>3</th>
      <th>Village</th>
      <th>TEXT</th>
      <th>-</th>
    </tr>
    <tr>
      <th>4</th>
      <th>Site Name</th>
      <th>TEXT</th>
      <th>-</th>
    </tr>
    <tr>
      <th>5</th>
      <th>Latitude</th>
      <th>DECIMAL</th>
      <th>-</th>
    </tr>
    <tr>
      <th>6</th>
      <th>Longitude</th>
      <th>DECIMAL</th>
      <th>-</th>
    </tr>
    <tr>
      <th rowspan="4" valign="top">7</th>
      <th rowspan="4" valign="top">Water Source Type 1</th>
      <th rowspan="4" valign="top">OPTION</th>
      <th>Deep well with distribution</th>
    </tr>
    <tr>
      <th>Hand dug well fitted with pump or windlass</th>
    </tr>
    <tr>
      <th>Protected spring</th>
    </tr>
    <tr>
      <th>Shallow well fitted with hand pump</th>
    </tr>
    <tr>
      <th rowspan="5" valign="top">8</th>
      <th rowspan="5" valign="top">Water Source Type</th>
      <th rowspan="5" valign="top">OPTION</th>
      <th>Deep wel</th>
    </tr>
    <tr>
      <th>Hand dug well</th>
    </tr>
    <tr>
      <th>Protected spring</th>
    </tr>
    <tr>
      <th>Shallow well</th>
    </tr>
    <tr>
      <th>Spring</th>
    </tr>
    <tr>
      <th rowspan="4" valign="top">9</th>
      <th rowspan="4" valign="top">Functionality Status</th>
      <th rowspan="4" valign="top">OPTION</th>
      <th>Functional</th>
    </tr>
    <tr>
      <th>No data</th>
    </tr>
    <tr>
      <th>Non functional</th>
    </tr>
    <tr>
      <th>Not functional</th>
    </tr>
    <tr>
      <th rowspan="6" valign="top">10</th>
      <th rowspan="6" valign="top">Souce Of Energy</th>
      <th rowspan="6" valign="top">OPTION</th>
      <th>Diesel</th>
    </tr>
    <tr>
      <th>Electricity and grid</th>
    </tr>
    <tr>
      <th>Gravity</th>
    </tr>
    <tr>
      <th>Manual operation</th>
    </tr>
    <tr>
      <th>Other</th>
    </tr>
    <tr>
      <th>Solar</th>
    </tr>
    <tr>
      <th>11</th>
      <th>Estimated Number Of Users</th>
      <th>OPTION</th>
      <th>Don't know</th>
    </tr>
    <tr>
      <th rowspan="3" valign="top">12</th>
      <th rowspan="3" valign="top">Hand Pump Type</th>
      <th rowspan="3" valign="top">OPTION</th>
      <th>Afridev</th>
    </tr>
    <tr>
      <th>Indian mark ii</th>
    </tr>
    <tr>
      <th>Submersible</th>
    </tr>
    <tr>
      <th rowspan="3" valign="top">13</th>
      <th rowspan="3" valign="top">Organisation That Installed The Water Pump</th>
      <th rowspan="3" valign="top">OPTION</th>
      <th>Cda</th>
    </tr>
    <tr>
      <th>Government</th>
    </tr>
    <tr>
      <th>Kale hiwot</th>
    </tr>
    <tr>
      <th>14</th>
      <th>Year Commisioned</th>
      <th>DECIMAL</th>
      <th>-</th>
    </tr>
    <tr>
      <th rowspan="5" valign="top">15</th>
      <th rowspan="5" valign="top">Reason For Inventory</th>
      <th rowspan="5" valign="top">OPTION</th>
      <th>Extension</th>
    </tr>
    <tr>
      <th>Inspection</th>
    </tr>
    <tr>
      <th>National wash inventory</th>
    </tr>
    <tr>
      <th>New scheme</th>
    </tr>
    <tr>
      <th>Repair</th>
    </tr>
    <tr>
      <th>16</th>
      <th>Functional Taps In The Scheme</th>
      <th>DECIMAL</th>
      <th>-</th>
    </tr>
    <tr>
      <th>17</th>
      <th>Number Of Non Functionaltaps In The Scheme</th>
      <th>DECIMAL</th>
      <th>-</th>
    </tr>
    <tr>
      <th>18</th>
      <th>Depth</th>
      <th>DECIMAL</th>
      <th>-</th>
    </tr>
    <tr>
      <th>19</th>
      <th>Yield</th>
      <th>DECIMAL</th>
      <th>-</th>
    </tr>
  </tbody>
</table>



<hr/>



<h1>Eth CLTS</h1>



<table border="1" class="dataframe">
  <thead>
    <tr>
      <th>ID</th>
      <th>QUESTION</th>
      <th>TYPE</th>
      <th>OPTIONS</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>1</th>
      <th>Woreda</th>
      <th>CASCADE</th>
      <th>-</th>
    </tr>
    <tr>
      <th>2</th>
      <th>Kebele</th>
      <th>CASCADE</th>
      <th>-</th>
    </tr>
    <tr>
      <th>3</th>
      <th>Village</th>
      <th>TEXT</th>
      <th>-</th>
    </tr>
    <tr>
      <th>4</th>
      <th>Latitude</th>
      <th>DECIMAL</th>
      <th>-</th>
    </tr>
    <tr>
      <th>5</th>
      <th>Longitude</th>
      <th>DECIMAL</th>
      <th>-</th>
    </tr>
    <tr>
      <th>6</th>
      <th>No. Of Hhs</th>
      <th>DECIMAL</th>
      <th>-</th>
    </tr>
    <tr>
      <th>7</th>
      <th>Initial Number Latrines</th>
      <th>DECIMAL</th>
      <th>-</th>
    </tr>
    <tr>
      <th>8</th>
      <th>Final Number Of Latrines</th>
      <th>DECIMAL</th>
      <th>-</th>
    </tr>
    <tr>
      <th>9</th>
      <th>Date Triggered</th>
      <th>TEXT</th>
      <th>-</th>
    </tr>
    <tr>
      <th rowspan="3" valign="top">10</th>
      <th rowspan="3" valign="top">Odf Status</th>
      <th rowspan="3" valign="top">OPTION</th>
      <th>Declared</th>
    </tr>
    <tr>
      <th>Triggered</th>
    </tr>
    <tr>
      <th>Verified</th>
    </tr>
    <tr>
      <th>11</th>
      <th>Date Of Declared</th>
      <th>DECIMAL</th>
      <th>-</th>
    </tr>
    <tr>
      <th>12</th>
      <th>Date Of Verification</th>
      <th>TEXT</th>
      <th>-</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">13</th>
      <th rowspan="2" valign="top">Implementing Partner</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>Amref</th>
    </tr>
    <tr>
      <th>Amref &amp; local gov't</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">14</th>
      <th rowspan="2" valign="top">Remarks</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>Phase i</th>
    </tr>
    <tr>
      <th>Phase ii</th>
    </tr>
    <tr>
      <th>15</th>
      <th>Time To Complete (Days)</th>
      <th>OPTION</th>
      <th>Sum only numbers showing/count of numbers showing</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">16</th>
      <th rowspan="2" valign="top">Progress Time</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>Current day - date triggered date</th>
    </tr>
    <tr>
      <th>Current day' - date triggered</th>
    </tr>
  </tbody>
</table>



<hr/>

