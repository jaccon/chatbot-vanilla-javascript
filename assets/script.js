function toggleChat() {
  const chatWidget = document.getElementById("chat-widget");
  chatWidget.classList.toggle("closed");
}

function closeChat() {
  const chatWidget = document.getElementById("chat-widget");
  chatWidget.classList.add("closed");
}

window.enviarMensagem = function() {
  const userInput = document.getElementById("user-input");
  const pergunta = userInput.value.trim();
  userInput.value = "";

  if (pergunta !== "") {
    exibirResposta(pergunta, true);
    setTimeout(() => {
      exibirDigitando();
      encontrarResposta(pergunta).then(resposta => {
        exibirResposta(resposta, false);
        removerDigitando();
        atualizarAlturaMensagens();
      }).catch(error => {
        console.error('Erro ao buscar resposta:', error);
        exibirResposta("Desculpe, ocorreu um erro ao buscar a resposta.", false);
        removerDigitando();
        atualizarAlturaMensagens();
      });
    }, 100);
  }
  return false;
};

async function encontrarResposta(pergunta) {
  try {
    // Fazer uma requisição para obter o JSON
    const response = await fetch('assets/chatbot-data.json');
    const data = await response.json();

    // Verificar se a pergunta contém alguma palavra-chave
    const palavrasChave = pergunta.split(/[ ,]+/); // Dividir a pergunta em palavras-chave
    const respostaEncontrada = data.perguntas.find(item => {
      return palavrasChave.some(palavra => item.pergunta.toLowerCase().includes(palavra.toLowerCase()));
    });

    // Se a resposta for encontrada, retornar a resposta correspondente
    if (respostaEncontrada) {
      return respostaEncontrada.resposta;
    } else {
      // Caso contrário, sugerir ao usuário que reformule a pergunta
      return "Desculpe, não encontrei uma resposta para essa pergunta. Você pode tentar perguntar de outra forma?";
    }
  } catch (error) {
    console.error('Erro ao buscar resposta no JSON:', error);
    throw new Error('Erro ao buscar resposta no JSON');
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

  // Verificar se a resposta contém uma marcação de imagem
  const imgPattern = /\[img\](.*?)\[\/img\]/g;
  if (imgPattern.test(resposta)) {
    // Substituir a marcação de imagem pela tag <img>
    resposta = resposta.replace(imgPattern, '<img src="$1" class="response-image">');
    // Inserir o HTML resultante na div da mensagem
    messageDiv.innerHTML = resposta;
  } else {
    messageDiv.textContent = resposta;
  }

  chatMessages.appendChild(messageDiv);
  if (!isUserMessage) {
    chatMessages.scrollTop = chatMessages.scrollHeight;
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
  if (typingIndicator) {
    chatMessages.removeChild(typingIndicator);
  }
}
