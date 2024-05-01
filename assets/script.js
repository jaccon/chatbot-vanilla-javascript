const delayBetweenMessages = 2000;
let isWaitingForResponse = false;
let currentQuestionIndex = 0;

window.onload = function() {
  fetch('assets/chatbot-data.json')
    .then(response => response.json())
    .then(data => {
      window.chatbotData = data;
    })
    .catch(error => console.error('Erro ao carregar dados do chatbot:', error));
};

function exibirMensagensIntro() {
  const introMessages = getMessages('intro');
  if (introMessages && introMessages.length > 0) {
    introMessages.forEach((message, index) => {
      setTimeout(() => exibirResposta(message.text, false), index * delayBetweenMessages + delayBetweenMessages);
    });
  }
  setTimeout(exibirQuestions, delayBetweenMessages * (introMessages ? introMessages.length : 0));
}

function exibirQuestions() {
  const questions = getMessages('questions');
  if (questions && questions.length > 0) {
    questions.forEach((question, index) => {
      setTimeout(() => exibirResposta(question.text, false), index * delayBetweenMessages + delayBetweenMessages);
    });
  }
}

function getMessages(type) {
  return window.chatbotData && window.chatbotData[type] && window.chatbotData[type].messages;
}

function toggleChat() {
  const chatWidget = document.getElementById("chat-widget");
  chatWidget.classList.toggle("closed");
  if (!chatWidget.classList.contains("closed")) {
    // Se o chat foi aberto, exibir as mensagens de introdução
    exibirMensagensIntro();
  }
}

function closeChat() {
  const chatWidget = document.getElementById("chat-widget");
  chatWidget.classList.add("closed");
}

window.enviarMensagem = function() {
  if (isWaitingForResponse) return false;
  
  const userInput = document.getElementById("user-input");
  const resposta = userInput.value.trim();
  userInput.value = "";

  if (resposta !== "") {
    exibirResposta(resposta, true);
    salvarResposta(resposta);
    isWaitingForResponse = true;

    setTimeout(() => {
      exibirDigitando();
      encontrarResposta(resposta)
        .then(resposta => {
          exibirResposta(resposta, false);
          removerDigitando();
          atualizarAlturaMensagens();
          isWaitingForResponse = false;
        })
        .catch(error => {
          console.error('Erro ao buscar resposta:', error);
          exibirResposta("Desculpe, ocorreu um erro ao buscar a resposta.", false);
          removerDigitando();
          atualizarAlturaMensagens();
          isWaitingForResponse = false;
        });
    }, 100);
  }
  return false;
};

function salvarResposta(resposta) {
  const userInput = resposta.split(',').map(item => item.trim());
  const userResponse = { name: userInput[0], email: userInput[1], phone: userInput[2] };
  document.cookie = `pagefai-chatbot=${JSON.stringify(userResponse)};`;
}

async function encontrarResposta(pergunta) {
  const response = await fetch('assets/chatbot-data.json');
  const data = await response.json();
  const palavrasChave = pergunta.split(/[ ,]+/);
  const respostaEncontrada = data.perguntas.find(item => palavrasChave.some(palavra => item.pergunta.toLowerCase().includes(palavra.toLowerCase())));

  if (respostaEncontrada) return respostaEncontrada.resposta;
  else throw new Error('Erro ao buscar resposta no JSON');
}

function atualizarAlturaMensagens() {
  const chatContainer = document.getElementById("chat-container");
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function exibirResposta(resposta, isUserMessage) {
  const chatMessages = document.getElementById("chat-messages");
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");
  messageDiv.classList.add(isUserMessage ? "user-message" : "server-response");

  const imgPattern = /\[img\](.*?)\[\/img\]/g;
  if (imgPattern.test(resposta)) {
    resposta = resposta.replace(imgPattern, '<img src="$1" class="response-image">');
    messageDiv.innerHTML = resposta;
  } else {
    messageDiv.textContent = resposta;
  }

  chatMessages.appendChild(messageDiv);
  if (!isUserMessage) chatMessages.scrollTop = chatMessages.scrollHeight;
}

function exibirDigitando() {
  const chatMessages = document.getElementById("chat-messages");
  const typingIndicator = document.createElement("div");
  typingIndicator.textContent = "Digitando...";
  typingIndicator.classList.add("message");
  typingIndicator.classList.add("typing-indicator");
  chatMessages.appendChild(typingIndicator);
}

function removerDigitando() {
  const chatMessages = document.getElementById("chat-messages");
  const typingIndicator = chatMessages.querySelector(".typing-indicator");
  if (typingIndicator) chatMessages.removeChild(typingIndicator);
}
