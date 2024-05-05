const delayBetweenMessages = 2000;
let isWaitingForResponse = false;
let currentQuestionIndex = 0;

window.onload = function () {
  fetch('assets/chatbot-data.json')
    .then(response => response.json())
    .then(data => {
      window.chatbotData = data;
      // Após carregar os dados do chatbot, exibir as mensagens de introdução
      exibirMensagensIntro();
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
}

function closeChat() {
  const chatWidget = document.getElementById("chat-widget");
  chatWidget.classList.add("closed");
}

window.enviarMensagem = function () {
  if (isWaitingForResponse) return false;

  const userInput = document.getElementById("user-input");
  const resposta = userInput.value.trim();
  userInput.value = "";

  if (resposta !== "") {
    exibirResposta(resposta, true);
    isWaitingForResponse = true;

    setTimeout(() => {
      exibirDigitando();
      handleUserMessage(resposta); // Chama a função para lidar com a mensagem do usuário
    }, 100);
  }
  return false;
};

function handleUserMessage(message) {
  encontrarResposta(message)
    .then(resposta => {
      exibirResposta(resposta, false);
    })
    .catch(error => {
      console.error('Erro ao buscar resposta:', error);
      exibirMensagemDeErro(); // Exibir mensagem de erro
    })
    .finally(() => {
      removerDigitando();
      atualizarAlturaMensagens();
      isWaitingForResponse = false;
    });
}

function encontrarResposta(pergunta) {
  return new Promise((resolve, reject) => {
    const data = window.chatbotData; // Usar os dados já carregados
    const palavrasChave = [pergunta.toLowerCase()]; // Inclui a pergunta inteira como uma palavra-chave
    const respostaExata = data.perguntas.find(item => item.pergunta.toLowerCase() === pergunta.toLowerCase());

    if (respostaExata) {
      resolve(respostaExata.resposta);
    } else {
      const respostaPorPalavra = data.perguntas.find(item => palavrasChave.some(palavra => item.pergunta.toLowerCase().includes(palavra)));
      if (respostaPorPalavra) {
        resolve(respostaPorPalavra.resposta);
      } else {
        // Exibir mensagem de erro se nenhuma resposta for encontrada
        reject(new Error('Resposta não encontrada.'));
      }
    }
  });
}

function exibirMensagemDeErro() {
  const errorMessages = getMessages('intro');
  if (errorMessages && errorMessages.handleError && errorMessages.handleError.length > 0) {
    const errorMessage = errorMessages.handleError[0].text;
    exibirResposta(errorMessage, false);
  } else {
    const defaultErrorMessage = "Ops, ocorreu um erro ao buscar a resposta. Por favor, faça uma pergunta mais específica.";
    exibirResposta(defaultErrorMessage, false);
  }
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

  const linkPattern = /\[link\](.*?)\[\/link\]/g;
  if (linkPattern.test(resposta)) {
    resposta = resposta.replace(linkPattern, '<a href="$1" target="_blank">link</a>');
  }

  const imgPattern = /\[img\](.*?)\[\/img\]/g;
  if (imgPattern.test(resposta)) {
    resposta = resposta.replace(imgPattern, '<img src="$1" class="response-image">');
    messageDiv.innerHTML = resposta;
  } else {
    messageDiv.innerHTML = resposta;
  }

  chatMessages.appendChild(messageDiv);
  if (!isUserMessage) {
    chatMessages.scrollTop = chatMessages.scrollHeight;
    // Reproduzir o som do beep
    const audio = new Audio('assets/audio/beep.mp3');
    audio.play();
  }
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

function fecharChat() {
  limparMensagens();
  toggleChat();
}

function limparMensagens() {
  document.getElementById('chat-messages').innerHTML = '';
}
