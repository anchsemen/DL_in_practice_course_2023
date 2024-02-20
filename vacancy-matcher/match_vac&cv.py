import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import pymorphy2
from transformers import GPT2Tokenizer, GPT2Model
import torch

morph = pymorphy2.MorphAnalyzer()
nltk.download('stopwords')
stop_words_russian = set(stopwords.words('russian'))

tokenizer = GPT2Tokenizer.from_pretrained('ai-forever/rugpt3large_based_on_gpt2')
model = GPT2Model.from_pretrained('ai-forever/rugpt3large_based_on_gpt2')


vac = pd.read_csv('vac_model_large_1.csv')
cv = pd.read_csv('cv_model_large_1.csv')
vac['Vectorized_Text_large'] = vac['Vectorized_Text_large'].apply(lambda x: eval(x))
cv['Vectorized_Text_large'] = cv['Vectorized_Text_large'].apply(lambda x: eval(x))

# CV/vac векторизация

def process_text_russian(text):
  if type(text) == str:
    tokens = [word for word in text.split() if word.lower() not in stop_words_russian]
    lemmatized_words = [morph.parse(word)[0].normal_form for word in tokens]
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
    input_text = input_text.apply(process_text_russian)
    tokens = tokenizer(input_text, return_tensors="pt", truncation=True, max_length=512)
    output = model(**tokens)
    reference_vector = output.last_hidden_state.mean(dim=1).squeeze().cpu().numpy()
    cv['Cosine_Similarity'] = cv['Vectorized_Text_large'].apply(lambda x: compute_cosine_similarity(reference_vector, x))
    cv['Euclidean_Distance'] = cv['Vectorized_Text_large'].apply(lambda x: compute_euclidean_distance(reference_vector, x))
    cv_sorted = cv.sort_values(by='Cosine_Similarity', ascending=False)
    top_matches = cv_sorted.head(5)
    return top_matches

def match_cv(input_text):
    input_text = input_text.apply(process_text_russian)
    tokens = tokenizer(input_text, return_tensors="pt", truncation=True, max_length=512)
    output = model(**tokens)
    reference_vector = output.last_hidden_state.mean(dim=1).squeeze().cpu().numpy()
    vac['Cosine_Similarity'] = vac['Vectorized_Text_large'].apply(lambda x: compute_cosine_similarity(reference_vector, x))
    vac['Euclidean_Distance'] = vac['Vectorized_Text_large'].apply(lambda x: compute_euclidean_distance(reference_vector, x))
    vac_sorted = vac.sort_values(by='Cosine_Similarity', ascending=False)
    top_matches = vac_sorted.head(5)
    return top_matches
    
    
    
