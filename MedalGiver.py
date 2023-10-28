from google.oauth2 import service_account
import pandas as pd
import gspread
import json
import base64
import os
from pynput.keyboard import Key, Controller
import time
from dotenv import load_dotenv, find_dotenv

def set_env():
    service_key = json.load(open('<Your JSON Cred key file path here>'))
    service_key = json.dumps(service_key)
    #encode the key so that I don't have to pass it to env character by character(and makes it more secure!)
    encoded_service_key = base64.b64encode(service_key.encode('utf-8'))
    os.environ['SERVICE_ACCOUNT_KEY'] = str(encoded_service_key)
    load_dotenv(find_dotenv())
    
    #remove first and last characters(garbage)
    encoded_key = os.getenv('SERVICE_ACCOUNT_KEY')
    encoded_key = str(encoded_key[2:-1])

    #decode and now its a json file that isn't messed up by str()
    orig_key = json.loads(base64.b64decode(encoded_key).decode('utf-8'))
    return orig_key


def init_sheet():
    scope = ['https://spreadsheets.google.com/feeds',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/spreadsheets']
    
    env_var = set_env()        #This is important for security reasons whenever I get to making it portable. Env variables far safe than a copy/paste
    creds = service_account.Credentials.from_service_account_info(env_var)
    creds_scope = creds.with_scopes(scope)
    client = gspread.authorize(creds_scope)

    spreadsheet = client.open_by_url('https://docs.google.com/spreadsheets/d/1xFmyV9CgMowLG66WhPU1h37eP0LJ4j1sR9GS35_MTMM/edit#gid=532837380')
    worksheet = spreadsheet.get_worksheet(2)
    record_data = worksheet.get_all_values()
    
    record_data_df = pd.DataFrame.from_dict(record_data) #Converts the sheet into a pandas data frame
    return record_data_df


def check_award(df, name, award):
    arr = []
    i = 7
    while df.loc[i][name] != "":
        if (df.iloc[i][award] == 'Award'):
            arr.append(df.iloc[i][name])
        i += 1
    return arr


def compile_medals(df):
    swordsBase = check_award(df, 10, 16)
    swords1 = check_award(df, 18, 24)
    swords2 = check_award(df, 26, 37)
    swords3 = check_award(df, 39, 50)
    marksBase = check_award(df, 52, 58)
    marks1 = check_award(df, 60, 66)
    marks2 = check_award(df, 68, 79)
    marks3 = check_award(df, 81, 92)
    gunBase = check_award(df, 94, 100)
    gun1 = check_award(df, 102, 108)
    gun2 = check_award(df, 110, 121)
    gun3 = check_award(df, 123, 134)
    helmsBase = check_award(df, 136, 142)
    helms1 = check_award(df, 144, 150)
    helms2 = check_award(df, 152, 163)
    helms3 = check_award(df, 165, 176)
    leadBase = check_award(df, 178, 184)
    lead1 = check_award(df, 186, 192)
    lead2 = check_award(df, 194, 205)
    lead3 = check_award(df, 207, 218)
    hash = {"Medal of Swordsmanship,None":swordsBase,
            "Medal of Swordsmanship,1-Star":swords1, 
            "Medal of Swordsmanship,2-Star":swords2,
            "Medal of Swordsmanship,3-Star":swords3,
            "Medal of Marksmanship,None":marksBase,
            "Medal of Marksmanship,1-Star":marks1,
            "Medal of Marksmanship,2-Star":marks2,
            "Medal of Marksmanship,3-Star":marks3,
            "Medal of Gunnery,None":gunBase,
            "Medal of Gunnery,1-Star":gun1,
            "Medal of Gunnery,2-Star":gun2,
            "Medal of Gunnery,3-Star":gun3,
            "Medal of Helmsmanship,None":helmsBase,
            "Medal of Helmsmanship,1-Star":helms1,
            "Medal of Helmsmanship,2-Star":helms2,
            "Medal of Helmsmanship,3-Star":helms3,
            "Medal of Leadership,None":leadBase,
            "Medal of Leadership,1-Star":lead1,
            "Medal of Leadership,2-Star":lead2,
            "Medal of Leadership,3-Star":lead3,
            }
    return hash

#just concatenates the strings and throws them into an array
def make_commands(hash):
    cmd_arr = []
    cmd = "//award "
    for key in hash:
        if(len(hash[key]) == 0):
            continue
        temp_cmd = cmd + key
        for name in hash[key]:
            temp_cmd = temp_cmd + "," + name
        cmd_arr.append(temp_cmd)
    return cmd_arr


def type(chars):
    flag = 0
    keyboard = Controller()
    i = 1 
    for char in chars:
        #This if/else is pretty much cause of roblox being a bit slow
        if (i == 1):
            keyboard.press(char)
            keyboard.release(char)
            time.sleep(.1)
        else:
            keyboard.press(char)
            keyboard.release(char)
            time.sleep(.01)
        #terminate at the end of the string
        if len(chars) == i:
            keyboard.press(Key.enter)
            keyboard.release(Key.enter)
            flag = 1
            break
        i += 1
    #Flag solves the race condition, sloppy way of doing it, but im not gonna implement semaphores for TL
    return flag
    
  

#current problem, race condition on the threads(fixed)
def execute_commands(arr):
    confirm_string = "//award confirm"
    
    time.sleep(2)
    for cmd in arr:
        flag = 0
        #ensures the next thread doesn't begin before executing the first
        while flag == 0:
            flag = type(cmd)
        #Reset the flag for the second run
        flag = 0
        #these sleep calls are cause of roblox again. 
        #Each command takes some time to execute, much more than on a text editor
        time.sleep(1.2)
        while flag == 0:
            flag = type(confirm_string)
        time.sleep(1.2)


if __name__ == "__main__":
    df = init_sheet()
    medal_table = compile_medals(df)
    commands = make_commands(medal_table)
    execute_commands(commands)

