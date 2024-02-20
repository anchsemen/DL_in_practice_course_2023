from transformers import GPT2Tokenizer, GPT2Model
import pymorphy3
from nltk.corpus import stopwords
import nltk
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import pandas as pd
from fastapi import FastAPI, Form, BackgroundTasks
import shutil
import requests

shutil.unpack_archive('vac_model_large_1.zip')
shutil.unpack_archive('cv_model_large_1.zip')
vac = pd.read_csv('vac_model_large_1.csv')
cv = pd.read_csv('cv_model_large_1.csv')

morph = pymorphy3.MorphAnalyzer()
# nltk.download('stopwords')
stop_words_russian = set(stopwords.words('russian'))
tokenizer = GPT2Tokenizer.from_pretrained(
    'ai-forever/rugpt3large_based_on_gpt2')
model = GPT2Model.from_pretrained('ai-forever/rugpt3large_based_on_gpt2')
vac = pd.read_csv('vac_model_large_1.csv')
cv = pd.read_csv('cv_model_large_1.csv')
vac['Vectorized_Text_large'] = vac['Vectorized_Text_large'].apply(
    lambda x: eval(x))
cv['Vectorized_Text_large'] = cv['Vectorized_Text_large'].apply(
    lambda x: eval(x))


def process_text_russian(text):
    if type(text) == str:
        tokens = [word for word in text.split() if word.lower()
                  not in stop_words_russian]
        lemmatized_words = [morph.parse(
            word)[0].normal_form for word in tokens]
        return ' '.join(lemmatized_words)


def compute_cosine_similarity(vector1, vector2):
    vector1 = np.array(vector1)
    vector2 = np.array(vector2)
    return cosine_similarity(vector1.reshape(1, -1), vector2.reshape(1, -1))[0, 0]


def compute_euclidean_distance(vector1, vector2):
    vector1 = np.array(vector1)
    vector2 = np.array(vector2)
    return np.linalg.norm(np.array(vector1).reshape(1, -1) - np.array(vector2).reshape(1, -1))


def match_vacancy(input_text):
    input_text = process_text_russian(input_text)
    tokens = tokenizer(input_text, return_tensors="pt",
                       truncation=True, max_length=512)
    output = model(**tokens)
    reference_vector = output.last_hidden_state.mean(
        dim=1).squeeze().detach().numpy()
    cv['Cosine_Similarity'] = cv['Vectorized_Text_large'].apply(
        lambda x: compute_cosine_similarity(reference_vector, x))
    cv['Euclidean_Distance'] = cv['Vectorized_Text_large'].apply(
        lambda x: compute_euclidean_distance(reference_vector, x))
    cv_sorted = cv.sort_values(by='Cosine_Similarity', ascending=False)
    top_matches = cv_sorted.head(5)
    top_matches = top_matches[[
        'Ищет работу на должность:', 'Cosine_Similarity', 'Euclidean_Distance']]
    return top_matches


def match_cv(input_text):
    input_text = process_text_russian(input_text)
    tokens = tokenizer(input_text, return_tensors="pt",
                       truncation=True, max_length=512)
    output = model(**tokens)
    reference_vector = output.last_hidden_state.mean(
        dim=1).squeeze().detach().numpy()
    vac['Cosine_Similarity'] = vac['Vectorized_Text_large'].apply(
        lambda x: compute_cosine_similarity(reference_vector, x))
    vac['Euclidean_Distance'] = vac['Vectorized_Text_large'].apply(
        lambda x: compute_euclidean_distance(reference_vector, x))
    vac_sorted = vac.sort_values(by='Cosine_Similarity', ascending=False)
    top_matches = vac_sorted.head(5)
    top_matches = top_matches[['vacancy_name',
                               'Cosine_Similarity', 'Euclidean_Distance']]
    return top_matches


app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/detection-response/{mode}/{chat_id}")
def process_video(mode: str, chat_id: int, text: str = Form(...), background_tasks: BackgroundTasks = None):
    try:
        if mode == 'cv':
            background_tasks.add_task(process_cv, chat_id, text)
        else:
            background_tasks.add_task(process_vac, chat_id, text)
        return {"success": True}
    except Exception as e:
        return {"error": str(e)}


def process_cv(chat_id: int, text: str):
    print('start processing')
    cv_matches = match_cv(text)
    result = {"cv_matches": cv_matches.to_dict()}

    target_url = 'http://localhost:3000/api/detection-response/cv/' + \
        str(chat_id)
    requests.post(target_url, json=result)


def process_vac(chat_id: int, text: str):
    print('start processing')
    vac_matches = match_vacancy(text)
    result = {"vac_matches": vac_matches.to_dict()}

    target_url = 'http://localhost:3000/api/detection-response/vacancy/' + \
        str(chat_id)
    requests.post(target_url, json=result)
