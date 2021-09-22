import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
path = './data/'

files = os.listdir(path)
files = list(filter(lambda x: 'form_eth' in x, files))

file = files[0]
df = pd.read_json(f"{path}{file}")
print(df)
