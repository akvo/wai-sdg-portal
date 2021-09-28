```python
import pandas as pd
import numpy as np
from openpyxl import load_workbook
from IPython.core.display import display, HTML
from pathlib import Path
import json
```


```python
css_rules = Path('dataframe.css').read_text()
HTML('<style>' + css_rules + '</style>')
```




<style>/* title of columns */
table {
  min-width: 100%;
}
table.dataframe thead th {
  font-size: 1.2em !important;
  padding-top: 0.2em !important;
  padding-bottom: 0.2em !important;
}

/* title of rows */
table.dataframe tbody th {
  font-size: 1.2em !important;
  border: 1px solid black !important;
}

/* style for each cell */
table.dataframe td {
  font-size: 1.15em !important;
  border: 1px solid black !important;
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
def generate_json_file(data, name):
    name = name.replace(" ","_").lower()
    json_object = json.dumps(data, indent = 4)
    with open(f"../backend/source/form_{name}.json", "w") as outfile:
        outfile.write(json_object)
```


```python
def get_definitions(data, form_name, location):
    forms = []
    jsonforms = []
    metaforms = []
    for index, col in enumerate(list(data)):
        datatype = data[col].dtypes
        formtype = "text"
        options = None
        meta = False
        if datatype == int:
            formtype = "number"
        if datatype == np.float64:
            formtype = "number"
        if datatype == object:
            test = data[col].dropna()
            test = test.str.lower()
            options = list(test.unique())
            if len(options) > 8:
                options = None
                formtype = "text"
            else:
                formtype = "option"
                if len(options) == 1:
                    for yn in ["yes","no"]:
                        if options[0].lower() == yn:
                            options = ["yes","no"]
                else:
                    options = [str(o).lower() for o in options]
        if col.strip().lower() in ['latitude','longitude']:
            col = 'geolocation'
            formtype = 'geo'
        if col.strip().lower() in location:
            formtype = 'administration'
        cname = col.replace("_"," ").lower().strip()
        if "|" in cname:
            cname = cname.split("|")[1].strip()
        if "name" in cname:
            meta = True
        if formtype == "option":
            jsonforms.append({"order": index + 1,"question": cname, "type": formtype, "meta": meta, "options": options})
            for opt in options:
                forms.append({"ID": index + 1,"QUESTION": cname, "TYPE": formtype.upper(), "OPTIONS": opt})
        elif formtype in ["geo","administration"]:
            cname = formtype
            if formtype == "geo":
                cname += "location"
            if formtype == "administration":
                cname = "location"
            if cname not in metaforms:
                metaforms.append(cname)
                jsonforms.append({"order": index + 1, "question": cname, "type": formtype, "meta": True, "options": None})
                forms.append({"ID": index + 1,"QUESTION": cname, "TYPE": formtype.upper(), "OPTIONS": " - " })
        else:
            jsonforms.append({"order": index + 1,"question": cname, "type": formtype, "meta": meta, "options": None})
            forms.append({"ID":  index + 1, "QUESTION": cname, "TYPE": formtype.upper(), "OPTIONS": " - "})
    generate_json_file(jsonforms, form_name)
    results = pd.DataFrame(forms).groupby(['ID','QUESTION','TYPE','OPTIONS']).first()
    display(HTML(f"<h1>{form_name}</h1>"))
    display(HTML(results.to_html()))
    display(HTML(f"<hr/>"))
    return results
```


```python
all_sheets = load_workbook(source, read_only=True).sheetnames
sheets = list(filter(lambda x: 'Eth' in x, all_sheets))

for sheet in sheets:
    data = pd.read_excel(source, sheet)
    data.drop(data.filter(regex="Unnamed"),axis=1, inplace=True)
    get_definitions(data, sheet, ["woreda","kebele"])
```


<h1>Eth HH</h1>



<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
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
      <th>location</th>
      <th>ADMINISTRATION</th>
      <th>-</th>
    </tr>
    <tr>
      <th>3</th>
      <th>village</th>
      <th>TEXT</th>
      <th>-</th>
    </tr>
    <tr>
      <th>4</th>
      <th>name of respondent</th>
      <th>TEXT</th>
      <th>-</th>
    </tr>
    <tr>
      <th>5</th>
      <th>household size</th>
      <th>NUMBER</th>
      <th>-</th>
    </tr>
    <tr>
      <th>6</th>
      <th>main source of drinking water</th>
      <th>TEXT</th>
      <th>-</th>
    </tr>
    <tr>
      <th rowspan="4" valign="top">7</th>
      <th rowspan="4" valign="top">water service level</th>
      <th rowspan="4" valign="top">OPTION</th>
      <th>basic</th>
    </tr>
    <tr>
      <th>limited</th>
    </tr>
    <tr>
      <th>surface water</th>
    </tr>
    <tr>
      <th>unimproved</th>
    </tr>
    <tr>
      <th rowspan="3" valign="top">8</th>
      <th rowspan="3" valign="top">specific location of water collection</th>
      <th rowspan="3" valign="top">OPTION</th>
      <th>elsewhere</th>
    </tr>
    <tr>
      <th>in own dwelling</th>
    </tr>
    <tr>
      <th>in own yard / plot</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">9</th>
      <th rowspan="2" valign="top">time to collect water</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>less than 30 minutes</th>
    </tr>
    <tr>
      <th>more than 30 minutes</th>
    </tr>
    <tr>
      <th rowspan="3" valign="top">10</th>
      <th rowspan="3" valign="top">times in last month when drinking water quantity was insufficient</th>
      <th rowspan="3" valign="top">OPTION</th>
      <th>don't know</th>
    </tr>
    <tr>
      <th>no, always sufficient</th>
    </tr>
    <tr>
      <th>yes, at least once</th>
    </tr>
    <tr>
      <th rowspan="4" valign="top">11</th>
      <th rowspan="4" valign="top">sanitation service level</th>
      <th rowspan="4" valign="top">OPTION</th>
      <th>basic</th>
    </tr>
    <tr>
      <th>limited</th>
    </tr>
    <tr>
      <th>safely managed</th>
    </tr>
    <tr>
      <th>unimproved</th>
    </tr>
    <tr>
      <th rowspan="8" valign="top">12</th>
      <th rowspan="8" valign="top">type of toilet facility</th>
      <th rowspan="8" valign="top">OPTION</th>
      <th>bucket</th>
    </tr>
    <tr>
      <th>pit latrine with slab</th>
    </tr>
    <tr>
      <th>pit latrine without slab/open pit</th>
    </tr>
    <tr>
      <th>there is no latrine</th>
    </tr>
    <tr>
      <th>toilet that flush/pour to flush piped sewer system</th>
    </tr>
    <tr>
      <th>toilet that flush/pour to pit latrine</th>
    </tr>
    <tr>
      <th>twinpit offset latrine</th>
    </tr>
    <tr>
      <th>ventilated improved pit latrine (vip)</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">13</th>
      <th rowspan="2" valign="top">facility is shared with others outside of the household</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>no</th>
    </tr>
    <tr>
      <th>yes</th>
    </tr>
    <tr>
      <th rowspan="3" valign="top">14</th>
      <th rowspan="3" valign="top">location of sanitation facility</th>
      <th rowspan="3" valign="top">OPTION</th>
      <th>elsewhere</th>
    </tr>
    <tr>
      <th>in own dwelling</th>
    </tr>
    <tr>
      <th>in own plot/yard</th>
    </tr>
    <tr>
      <th rowspan="3" valign="top">15</th>
      <th rowspan="3" valign="top">emptying of on-site sanitation facilities</th>
      <th rowspan="3" valign="top">OPTION</th>
      <th>don't know</th>
    </tr>
    <tr>
      <th>no, never emptied</th>
    </tr>
    <tr>
      <th>yes, but don't know when</th>
    </tr>
    <tr>
      <th rowspan="3" valign="top">16</th>
      <th rowspan="3" valign="top">hygiene service level</th>
      <th rowspan="3" valign="top">OPTION</th>
      <th>basic</th>
    </tr>
    <tr>
      <th>limited</th>
    </tr>
    <tr>
      <th>no facility</th>
    </tr>
    <tr>
      <th rowspan="5" valign="top">17</th>
      <th rowspan="5" valign="top">type of handwashing facility used most often</th>
      <th rowspan="5" valign="top">OPTION</th>
      <th>fixed facility observed in dwelling</th>
    </tr>
    <tr>
      <th>fixed facility observed in plot/yard</th>
    </tr>
    <tr>
      <th>mobile object observed (bucket, jug, kettle)</th>
    </tr>
    <tr>
      <th>no handwashing place available in dwelling/plot/yard</th>
    </tr>
    <tr>
      <th>no permission to see</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">18</th>
      <th rowspan="2" valign="top">water available at handwashing facility</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>water is available</th>
    </tr>
    <tr>
      <th>water is not available</th>
    </tr>
    <tr>
      <th rowspan="3" valign="top">19</th>
      <th rowspan="3" valign="top">soap is available</th>
      <th rowspan="3" valign="top">OPTION</th>
      <th>ash/mud/sand is present</th>
    </tr>
    <tr>
      <th>no, not present</th>
    </tr>
    <tr>
      <th>yes, soap or detergent are present</th>
    </tr>
  </tbody>
</table>



<hr/>



<h1>Eth Health</h1>



<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
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
      <th>location</th>
      <th>ADMINISTRATION</th>
      <th>-</th>
    </tr>
    <tr>
      <th>3</th>
      <th>name of health facility</th>
      <th>TEXT</th>
      <th>-</th>
    </tr>
    <tr>
      <th>4</th>
      <th>geolocation</th>
      <th>GEO</th>
      <th>-</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">6</th>
      <th rowspan="2" valign="top">type of healthy facility</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>health post</th>
    </tr>
    <tr>
      <th>other</th>
    </tr>
    <tr>
      <th rowspan="4" valign="top">7</th>
      <th rowspan="4" valign="top">description of water supply in health facilities</th>
      <th rowspan="4" valign="top">OPTION</th>
      <th>no water supply in premises</th>
    </tr>
    <tr>
      <th>pipeline connections</th>
    </tr>
    <tr>
      <th>protected wells</th>
    </tr>
    <tr>
      <th>rain water harvesting</th>
    </tr>
    <tr>
      <th rowspan="3" valign="top">8</th>
      <th rowspan="3" valign="top">water</th>
      <th rowspan="3" valign="top">OPTION</th>
      <th>basic</th>
    </tr>
    <tr>
      <th>limited</th>
    </tr>
    <tr>
      <th>no service</th>
    </tr>
    <tr>
      <th rowspan="3" valign="top">9</th>
      <th rowspan="3" valign="top">latrine description</th>
      <th rowspan="3" valign="top">OPTION</th>
      <th>no latrine</th>
    </tr>
    <tr>
      <th>simple pit latrine</th>
    </tr>
    <tr>
      <th>vip</th>
    </tr>
    <tr>
      <th rowspan="3" valign="top">10</th>
      <th rowspan="3" valign="top">sanitation</th>
      <th rowspan="3" valign="top">OPTION</th>
      <th>limited</th>
    </tr>
    <tr>
      <th>no service</th>
    </tr>
    <tr>
      <th>usable</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">11</th>
      <th rowspan="2" valign="top">physically separate latrines for male female patients</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>no</th>
    </tr>
    <tr>
      <th>yes</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">12</th>
      <th rowspan="2" valign="top">facilitated access for disabled</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>no</th>
    </tr>
    <tr>
      <th>yes</th>
    </tr>
    <tr>
      <th rowspan="3" valign="top">13</th>
      <th rowspan="3" valign="top">latrine condition</th>
      <th rowspan="3" valign="top">OPTION</th>
      <th>clean, used</th>
    </tr>
    <tr>
      <th>dirty but used</th>
    </tr>
    <tr>
      <th>filthy ,unused</th>
    </tr>
    <tr>
      <th>14</th>
      <th>is there hand washing facility with in 5m of the toilet</th>
      <th>OPTION</th>
      <th>no facility</th>
    </tr>
    <tr>
      <th>15</th>
      <th>hygiene</th>
      <th>OPTION</th>
      <th>no service</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">16</th>
      <th rowspan="2" valign="top">is hand washing facility operating i.e with water</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>no</th>
    </tr>
    <tr>
      <th>yes</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">17</th>
      <th rowspan="2" valign="top">is soap available at each hand washing stand</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>no</th>
    </tr>
    <tr>
      <th>yes</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">18</th>
      <th rowspan="2" valign="top">is there a toilet for staff</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>no</th>
    </tr>
    <tr>
      <th>yes</th>
    </tr>
  </tbody>
</table>



<hr/>



<h1>Eth School</h1>



<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
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
      <th>location</th>
      <th>ADMINISTRATION</th>
      <th>-</th>
    </tr>
    <tr>
      <th>3</th>
      <th>school name</th>
      <th>TEXT</th>
      <th>-</th>
    </tr>
    <tr>
      <th>4</th>
      <th>geolocation</th>
      <th>GEO</th>
      <th>-</th>
    </tr>
    <tr>
      <th rowspan="3" valign="top">6</th>
      <th rowspan="3" valign="top">school type</th>
      <th rowspan="3" valign="top">OPTION</th>
      <th>high school 9-10</th>
    </tr>
    <tr>
      <th>primary(1-4)</th>
    </tr>
    <tr>
      <th>primary(1-8)</th>
    </tr>
    <tr>
      <th>7</th>
      <th>male pupils</th>
      <th>NUMBER</th>
      <th>-</th>
    </tr>
    <tr>
      <th>8</th>
      <th>female pupils</th>
      <th>NUMBER</th>
      <th>-</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">9</th>
      <th rowspan="2" valign="top">reason for inventory</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>new scheme</th>
    </tr>
    <tr>
      <th>repair</th>
    </tr>
    <tr>
      <th rowspan="4" valign="top">10</th>
      <th rowspan="4" valign="top">water supply source</th>
      <th rowspan="4" valign="top">OPTION</th>
      <th>no water scheme</th>
    </tr>
    <tr>
      <th>no water supply in premises</th>
    </tr>
    <tr>
      <th>pipeline connection</th>
    </tr>
    <tr>
      <th>shallow well fitted with pump</th>
    </tr>
    <tr>
      <th rowspan="3" valign="top">11</th>
      <th rowspan="3" valign="top">water</th>
      <th rowspan="3" valign="top">OPTION</th>
      <th>basic</th>
    </tr>
    <tr>
      <th>limited</th>
    </tr>
    <tr>
      <th>no service</th>
    </tr>
    <tr>
      <th>12</th>
      <th>year commisioned</th>
      <th>NUMBER</th>
      <th>-</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">13</th>
      <th rowspan="2" valign="top">functionality status of water supply</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>functional</th>
    </tr>
    <tr>
      <th>non functional - mechanical</th>
    </tr>
    <tr>
      <th>14</th>
      <th>yield</th>
      <th>NUMBER</th>
      <th>-</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">15</th>
      <th rowspan="2" valign="top">type of latrine</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>no latrine</th>
    </tr>
    <tr>
      <th>simple pit latrine</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">16</th>
      <th rowspan="2" valign="top">sanitation</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>limited</th>
    </tr>
    <tr>
      <th>no service</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">17</th>
      <th rowspan="2" valign="top">latrine for boys and girls separate</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>no</th>
    </tr>
    <tr>
      <th>yes</th>
    </tr>
    <tr>
      <th>18</th>
      <th>number of boy pupils</th>
      <th>NUMBER</th>
      <th>-</th>
    </tr>
    <tr>
      <th>19</th>
      <th>number of girl pupils</th>
      <th>NUMBER</th>
      <th>-</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">20</th>
      <th rowspan="2" valign="top">are there latrines for disabled?</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>no</th>
    </tr>
    <tr>
      <th>yes</th>
    </tr>
    <tr>
      <th rowspan="3" valign="top">21</th>
      <th rowspan="3" valign="top">latrine condition</th>
      <th rowspan="3" valign="top">OPTION</th>
      <th>clean, used</th>
    </tr>
    <tr>
      <th>dirty but used</th>
    </tr>
    <tr>
      <th>no latrine</th>
    </tr>
    <tr>
      <th>22</th>
      <th>hygiene service level</th>
      <th>OPTION</th>
      <th>no service</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">23</th>
      <th rowspan="2" valign="top">presence of handwashingfacility</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>no</th>
    </tr>
    <tr>
      <th>yes</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">24</th>
      <th rowspan="2" valign="top">hand washing in use</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>no</th>
    </tr>
    <tr>
      <th>yes</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">25</th>
      <th rowspan="2" valign="top">availability of soap</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>no</th>
    </tr>
    <tr>
      <th>yes</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">26</th>
      <th rowspan="2" valign="top">urinal present girls</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>no</th>
    </tr>
    <tr>
      <th>yes</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">27</th>
      <th rowspan="2" valign="top">urinal present boys</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>no</th>
    </tr>
    <tr>
      <th>yes</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">28</th>
      <th rowspan="2" valign="top">separate latrine for tolitet staff</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>no</th>
    </tr>
    <tr>
      <th>yes</th>
    </tr>
  </tbody>
</table>



<hr/>



<h1>Eth WP</h1>



<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
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
      <th>location</th>
      <th>ADMINISTRATION</th>
      <th>-</th>
    </tr>
    <tr>
      <th>3</th>
      <th>village</th>
      <th>TEXT</th>
      <th>-</th>
    </tr>
    <tr>
      <th>4</th>
      <th>site name</th>
      <th>TEXT</th>
      <th>-</th>
    </tr>
    <tr>
      <th>5</th>
      <th>geolocation</th>
      <th>GEO</th>
      <th>-</th>
    </tr>
    <tr>
      <th rowspan="4" valign="top">7</th>
      <th rowspan="4" valign="top">water source type 1</th>
      <th rowspan="4" valign="top">OPTION</th>
      <th>deep well with distribution</th>
    </tr>
    <tr>
      <th>hand dug well fitted with pump or windlass</th>
    </tr>
    <tr>
      <th>protected spring</th>
    </tr>
    <tr>
      <th>shallow well fitted with hand pump</th>
    </tr>
    <tr>
      <th rowspan="5" valign="top">8</th>
      <th rowspan="5" valign="top">water source type</th>
      <th rowspan="5" valign="top">OPTION</th>
      <th>deep wel</th>
    </tr>
    <tr>
      <th>hand dug well</th>
    </tr>
    <tr>
      <th>protected spring</th>
    </tr>
    <tr>
      <th>shallow well</th>
    </tr>
    <tr>
      <th>spring</th>
    </tr>
    <tr>
      <th rowspan="4" valign="top">9</th>
      <th rowspan="4" valign="top">functionality status</th>
      <th rowspan="4" valign="top">OPTION</th>
      <th>functional</th>
    </tr>
    <tr>
      <th>no data</th>
    </tr>
    <tr>
      <th>non functional</th>
    </tr>
    <tr>
      <th>not functional</th>
    </tr>
    <tr>
      <th rowspan="6" valign="top">10</th>
      <th rowspan="6" valign="top">souce of energy</th>
      <th rowspan="6" valign="top">OPTION</th>
      <th>diesel</th>
    </tr>
    <tr>
      <th>electricity and grid</th>
    </tr>
    <tr>
      <th>gravity</th>
    </tr>
    <tr>
      <th>manual operation</th>
    </tr>
    <tr>
      <th>other</th>
    </tr>
    <tr>
      <th>solar</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">11</th>
      <th rowspan="2" valign="top">estimated number of users</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>don't know</th>
    </tr>
    <tr>
      <th>nan</th>
    </tr>
    <tr>
      <th rowspan="3" valign="top">12</th>
      <th rowspan="3" valign="top">hand pump type</th>
      <th rowspan="3" valign="top">OPTION</th>
      <th>afridev</th>
    </tr>
    <tr>
      <th>indian mark ii</th>
    </tr>
    <tr>
      <th>submersible</th>
    </tr>
    <tr>
      <th rowspan="3" valign="top">13</th>
      <th rowspan="3" valign="top">organisation that installed the water pump</th>
      <th rowspan="3" valign="top">OPTION</th>
      <th>cda</th>
    </tr>
    <tr>
      <th>government</th>
    </tr>
    <tr>
      <th>kale hiwot</th>
    </tr>
    <tr>
      <th>14</th>
      <th>year commisioned</th>
      <th>NUMBER</th>
      <th>-</th>
    </tr>
    <tr>
      <th rowspan="5" valign="top">15</th>
      <th rowspan="5" valign="top">reason for inventory</th>
      <th rowspan="5" valign="top">OPTION</th>
      <th>extension</th>
    </tr>
    <tr>
      <th>inspection</th>
    </tr>
    <tr>
      <th>national wash inventory</th>
    </tr>
    <tr>
      <th>new scheme</th>
    </tr>
    <tr>
      <th>repair</th>
    </tr>
    <tr>
      <th>16</th>
      <th>functional taps in the scheme</th>
      <th>NUMBER</th>
      <th>-</th>
    </tr>
    <tr>
      <th>17</th>
      <th>number of non functionaltaps in the scheme</th>
      <th>NUMBER</th>
      <th>-</th>
    </tr>
    <tr>
      <th>18</th>
      <th>depth</th>
      <th>NUMBER</th>
      <th>-</th>
    </tr>
    <tr>
      <th>19</th>
      <th>yield</th>
      <th>NUMBER</th>
      <th>-</th>
    </tr>
  </tbody>
</table>



<hr/>



<h1>Eth CLTS</h1>



<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
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
      <th>location</th>
      <th>ADMINISTRATION</th>
      <th>-</th>
    </tr>
    <tr>
      <th>3</th>
      <th>village</th>
      <th>TEXT</th>
      <th>-</th>
    </tr>
    <tr>
      <th>4</th>
      <th>geolocation</th>
      <th>GEO</th>
      <th>-</th>
    </tr>
    <tr>
      <th>6</th>
      <th>no. of hhs</th>
      <th>NUMBER</th>
      <th>-</th>
    </tr>
    <tr>
      <th>7</th>
      <th>initial number latrines</th>
      <th>NUMBER</th>
      <th>-</th>
    </tr>
    <tr>
      <th>8</th>
      <th>final number of latrines</th>
      <th>NUMBER</th>
      <th>-</th>
    </tr>
    <tr>
      <th>9</th>
      <th>date triggered</th>
      <th>TEXT</th>
      <th>-</th>
    </tr>
    <tr>
      <th rowspan="3" valign="top">10</th>
      <th rowspan="3" valign="top">odf status</th>
      <th rowspan="3" valign="top">OPTION</th>
      <th>declared</th>
    </tr>
    <tr>
      <th>triggered</th>
    </tr>
    <tr>
      <th>verified</th>
    </tr>
    <tr>
      <th>11</th>
      <th>date of declared</th>
      <th>NUMBER</th>
      <th>-</th>
    </tr>
    <tr>
      <th>12</th>
      <th>date of verification</th>
      <th>TEXT</th>
      <th>-</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">13</th>
      <th rowspan="2" valign="top">implementing partner</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>amref</th>
    </tr>
    <tr>
      <th>amref &amp; local gov't</th>
    </tr>
    <tr>
      <th rowspan="2" valign="top">14</th>
      <th rowspan="2" valign="top">remarks</th>
      <th rowspan="2" valign="top">OPTION</th>
      <th>phase i</th>
    </tr>
    <tr>
      <th>phase ii</th>
    </tr>
    <tr>
      <th>15</th>
      <th>time to complete (days)</th>
      <th>NUMBER</th>
      <th>-</th>
    </tr>
  </tbody>
</table>



<hr/>

