let streamReader;

async function sendRequest() {
  const prompt = document.getElementById('prompt').value + "(maximum 80 words)";
  const requestData = {
    model: "deepseek-coder:6.7b",
    prompt: prompt,
    stream: true
  };

  try {
    const response = await fetch('http://localhost:11434/api/generate', { 
    method: 'POST',
/*       headers: {
        'Content-Type': 'application/json'
      }, */
    body: JSON.stringify(requestData)
    });

    streamReader = response.body.getReader();
    readStream();
  } catch (error) {
    console.error('Error:', error);
  }
}

async function readStream() {
const responseContainer = document.getElementById('response-container');
responseContainer.setAttribute("class","bg-body-secondary p-4 rounded-4 border border-secondary-subtle");
responseContainer.innerHTML = '<h3>Response:</h3>';
const responseText = document.createElement('div');
responseContainer.appendChild(responseText);



let accumulatedResponse = '';
  let tot = "";
while (true) {
  const { done, value } = await streamReader.read();
  if (done) {
    break;
  }

  const chunk = new TextDecoder().decode(value);
  const parsedObject = JSON.parse(chunk);
  const response = parsedObject.response;
  tot += response ;
  accumulatedResponse += chunk;

  // Check if the chunk ends with a newline character
  if (chunk.endsWith('\n')) {
    try {
      //const parsedChunk = JSON.parse(accumulatedResponse);
      //responseText.textContent = parsedChunk.response || ''; // Extract the response field
      responseText.innerHTML = marked.parse(tot);     
      // accumulatedResponse = ''; // Reset accumulated response
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  }
}
console.log(tot)
tot = '';

}