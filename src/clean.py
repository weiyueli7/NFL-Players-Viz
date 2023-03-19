import pandas as pd
import numpy as np


df = pd.read_json('../data/players.json')
df['position'] = df['position'].replace(
    {
    'T': 'OL', 'G': 'OL', 'C': 'OL', 'OT': 'OL', 'G-C': 'OL', 'C-G': 'OL', 'OG': 'OL',
    'G-T': 'OL', 'T-G': 'OL', 'CB': 'DB', 'S': 'DB', 'HB-DB': 'DB', 'DB-HB': 'DB',
    'RS': 'DB', 'SS': 'DB', 'DE': 'DL', 'DT': 'DL', 'B': 'RB', 'FB': 'RB', 'HB': 'RB',
    'BB': 'RB', 'NT': 'DL', 'DE-DT': 'DL', 'DT-DE': 'DL', 'C-LB': 'LB', 'G-LB': 'LB',
    'OLB': 'LB', 'ILB': 'LB', 'WB': 'RB', 'FS': 'DB', 'E-DE': 'DL', 'DE-LB': 'LB',
    'LB-DE': 'LB', 'T-DT': 'DL', 'FB-LB': 'LB', 'DE-NT': 'DL', 'DB-WR': 'WR',
    'C-T': 'OL', 'C-G-T': 'OL', 'DT-T': 'DL', 'FB-HB': 'RB', 'DE-E': 'DL', 'LB-C': 'LB',
    'G-C-T': 'OL', 'G-T-TE': 'TE', 'E-DB': 'DB', 'TE-WR': 'WR', 'DT-NT': 'DL', 'NT-DT': 'DL',
    'HB-FB': 'RB', 'TB-HB': 'RB', 'C-T-G': 'OL', 'G-T-C': 'OL', 'WB-HB': 'RB',
    'QB-DB': 'DB', 'LB-FB': 'LB', 'NT-DE': 'DL', 'T-G-C': 'OL', 'T-C': 'OL', 'RB-WR': 'WR',
    'B-E': 'RB', 'E-T': 'OL', 'E-B': 'RB', 'DT-NT-DE': 'DL', 'TB': 'RB', 'WB-DB': 'DB',
    'T-E': 'OL', 'T-G-E': 'OL', 'E': 'TE', 'T-DE': 'DL'
     }
    )
def height_convert(height):
    ft, inch = height.split("-")
    return (int(ft)*12 + int(inch))
target = list(df['position'].value_counts(normalize=True).to_dict().keys())[:11]
df = df[df['position'].apply(lambda x: x in target)].dropna(subset=['birth_place', 'weight', 'height', 'college', 'draft_round', 'draft_position'])
df['birth_state'] = df['birth_place'].apply(lambda x: x[-2:])
df['height'] = df['height'].apply(height_convert)
states = pd.read_html('https://developers.google.com/public-data/docs/canonical/states_csv')[0]
states = states.rename(columns={'name': 'state_name'})
df = df.merge(states, left_on='birth_state', right_on='state', how='inner')
df = df[df['birth_state'].apply(lambda x: x not in ['AK', 'HI'])]
df['current_salary'] =df['current_salary'].str.replace(',', '').astype(float) / 1000
df.to_csv('../data/nfl_players.csv', index=False)
print('Data cleaned! Resulting data saved!')

