import requests

url = 'http://localhost:5000/chat'
data = {'message': 'You are an exceptionally intelligent coding assistant.'}
response = requests.post(url, json=data)
print(response.json())
