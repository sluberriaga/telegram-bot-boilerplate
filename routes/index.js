var express = require("express");
var store = require("./store");
var client = require("./../client");
var applyEasterEgg = require("./easterEgg");
var menu = require("./menu");

var router = express.Router();
var warningCallbackTimeout = null;
var closingCallbackTimeout = null;
var DURACION_MINUTO = 60;
var CHAT_PARAISO_NATURAL_ID = -1001437672733;

router.post("/check", (req, res) => {
  handleMessage(req.body);
  res.send({
    ok: true
  });
});

function handleMessage(request) {
  if (request.result.length > 0) {
    request.result.forEach(chatMessage => {
      if (chatMessage.message.text) {
        const texto = chatMessage.message.text;
        const command = chatMessage.message.text.toLowerCase();

        if (command.startsWith("/abrir")) {
          client.sendMessage(chatMessage.message.chat.id, abrir(chatMessage, command, client).mensaje);
        } else if (command.startsWith("/cerrar")) {
          client.sendMessage(chatMessage.message.chat.id, cerrar(chatMessage, command).mensaje);
        } else if (command.startsWith("/pedir")) {
          client.sendMessage(
            chatMessage.message.chat.id,
            applyEasterEgg(chatMessage, pedir(chatMessage, command).mensaje),
            { parse_mode: "Markdown" }
          );
        } else if (command.startsWith("/pedido")) {
          client.sendMessage(chatMessage.message.chat.id, pedido(chatMessage, command).mensaje);
        } else if (command.startsWith("/ventrilocuar")) {
          client.sendMessage(CHAT_PARAISO_NATURAL_ID, texto.substring("/ventrilocuar".length).trim());
        } else if (command.startsWith("/telefono")) {
          client.sendMessage(chatMessage.message.chat.id, telefono(chatMessage, command).mensaje);
        } else if (command.startsWith("/sugerenciavegetariana")) {
          client.sendMessage(chatMessage.message.chat.id, sugerenciaVegetariana(chatMessage, command).mensaje);
        } else if (command.startsWith("/sugerencia")) {
          client.sendMessage(chatMessage.message.chat.id, sugerencia(chatMessage, command).mensaje);
        } else if (command.startsWith("/menu")) {
          client.sendMessage(chatMessage.message.chat.id, mostrarMenu(chatMessage, command).mensaje);
        } else if (command.startsWith("/qr")) {
          client.sendPhoto(chatMessage.message.chat.id, "AgADAQADbqgxG--wKERNgktIZMI8NP-3CjAABIToFvdIT3dNfVMCAAEC");
        }
      }
    });

    lastUpdateID = response.result[response.result.length - 1].update_id;
    store.save("lastUpdateID", lastUpdateID);
  }
}

checkUpdate();

function checkUpdate() {
  let lastUpdateID = store.read("lastUpdateID");
  lastUpdateID = lastUpdateID === null ? 0 : lastUpdateID;

  client
    .getUpdates({
      allowed_updates: ["message"],
      offset: lastUpdateID + 1,
      timeout: 1
    })
    .promise()
    .then(
      function(response) {
        console.log(JSON.stringify(response));
        if (response.result.length > 0) {
          response.result.forEach(chatMessage => {
            if (chatMessage.message.text) {
              const texto = chatMessage.message.text;
              const command = chatMessage.message.text.toLowerCase();

              if (command.startsWith("/abrir")) {
                client.sendMessage(chatMessage.message.chat.id, abrir(chatMessage, command, client).mensaje);
              } else if (command.startsWith("/cerrar")) {
                client.sendMessage(chatMessage.message.chat.id, cerrar(chatMessage, command).mensaje);
              } else if (command.startsWith("/pedir")) {
                client.sendMessage(
                  chatMessage.message.chat.id,
                  applyEasterEgg(chatMessage, pedir(chatMessage, command).mensaje),
                  { parse_mode: "Markdown" }
                );
              } else if (command.startsWith("/pedido")) {
                client.sendMessage(chatMessage.message.chat.id, pedido(chatMessage, command).mensaje);
              } else if (command.startsWith("/ventrilocuar")) {
                client.sendMessage(CHAT_PARAISO_NATURAL_ID, texto.substring("/ventrilocuar".length).trim());
              } else if (command.startsWith("/telefono")) {
                client.sendMessage(chatMessage.message.chat.id, telefono(chatMessage, command).mensaje);
              } else if (command.startsWith("/sugerenciavegetariana")) {
                client.sendMessage(chatMessage.message.chat.id, sugerenciaVegetariana(chatMessage, command).mensaje);
              } else if (command.startsWith("/sugerencia")) {
                client.sendMessage(chatMessage.message.chat.id, sugerencia(chatMessage, command).mensaje);
              } else if (command.startsWith("/menu")) {
                client.sendMessage(chatMessage.message.chat.id, mostrarMenu(chatMessage, command).mensaje);
              } else if (command.startsWith("/qr")) {
                client.sendPhoto(
                  chatMessage.message.chat.id,
                  "AgADAQADbqgxG--wKERNgktIZMI8NP-3CjAABIToFvdIT3dNfVMCAAEC"
                );
              }
            }
          });

          lastUpdateID = response.result[response.result.length - 1].update_id;
          store.save("lastUpdateID", lastUpdateID);
        }
        setTimeout(checkUpdate, 500);
      },
      function(err) {
        console.log(err);
        setTimeout(checkUpdate, 500);
      }
    );
}

function mostrarMenu(chatMessage, command) {
  const mensaje = Object.keys(menu)
    .map(formatCategoria)
    .join("");

  function formatCategoria(categoria) {
    return `${capitalize(categoria)}\n  - Platos\n${menu[categoria].platos.map(plato => `    - ${plato}\n`).join("")}${
      categoria === "pastas" ? `  - Salsas\n${menu[categoria].salsas.map(salsa => `    - ${salsa}\n`).join("")}` : ""
    }`;
  }

  return { result: true, mensaje };
}

function sugerencia(chatMessage, command) {
  const categoria = getRandomProperty(menu);
  const plato = shuffle(categoria.platos)[0];
  const mensaje = `Mi sugerencia es:\n  - ${plato}`;
  let salsa;

  if (categoria === "pastas") {
    salsa = shuffle(categoria.salsas)[0];
    return { result: true, mensaje: `${mensaje} con salsa ${salsa}` };
  }

  return { result: true, mensaje };
}

function sugerenciaVegetariana(chatMessage, command) {
  const plato = shuffle(menu.ensaladas.platos)[0];
  const mensaje = `Mi sugerencia es:\n  - ${plato}`;

  return { result: true, mensaje };
}

function pedido(chatMessage, command) {
  let pedidoActual = store.read("pedidoActual");

  if (!pedidoActual) {
    return { resultado: false, mensaje: "No existe un pedido abierto!" };
  }

  return {
    resultado: true,
    mensaje:
      `Pedidos:\n` +
      pedidoActual.pedidos
        .sort((a, b) => (a.pedido > b.pedido ? 1 : -1))
        .map(pedido => `${pedido.de} - ${pedido.pedido}\n`)
        .join("")
  };
}

function abrir(chatMessage, command, client) {
  if (store.read("pedidoActual")) {
    return { resultado: false, mensaje: "Ya existe un pedido abierto!" };
  }

  const minutosHastaCierre = parseInt(command.substring("/abrir".length).trim(), 10);
  if (Number.isNaN(minutosHastaCierre)) {
    return {
      resultado: false,
      mensaje:
        "No puedo parsear ese mensaje como un entero!\nPor favor, especificá la cantidad de minutos hasta cerrar el pedido, eg. /abrir 60"
    };
  } else {
    closingCallbackTimeout = setTimeout(() => {
      client.sendMessage(chatMessage.message.chat.id, cerrar(chatMessage, "/cerrar").mensaje);
    }, minutosHastaCierre * DURACION_MINUTO * 1000);
    if (minutosHastaCierre > 10) {
      warningCallbackTimeout = setTimeout(
        () => client.sendMessage(chatMessage.message.chat.id, "El pedido cierra en 10 minutos!"),
        (minutosHastaCierre - 10) * DURACION_MINUTO * 1000
      );
    }
  }

  store.save("pedidoActual", {
    created_at: Date.now(),
    pedidos: [],
    estado: "abierto"
  });

  return {
    resultado: true,
    mensaje: `Listo, ya podes realizar tu pedido!\nEn ${minutosHastaCierre} cierro el pedido!`
  };
}

function cerrar(chatMessage, command) {
  let pedidoActual = store.read("pedidoActual");
  let cant_responsables = 1;
  let mensaje = "Se cerro el pedido pero estaba vacío!";

  if (!pedidoActual) {
    return { resultado: false, mensaje: "No existe un pedido abierto!" };
  }

  clearTimeout(closingCallbackTimeout);
  clearTimeout(warningCallbackTimeout);

  store.save("pedidoActual", {
    ...pedidoActual,
    estado: "cerrado"
  });

  const responsables = shuffle(Array.from(pedidoActual.pedidos.map(pedido => pedido.de)));

  if (responsables.length >= 4) {
    cant_responsables = responsables.length / 4;
  }

  let deliverys = responsables.filter((r, i) => i > 0 && i <= cant_responsables).join("\n - ");

  if (deliverys.length == 0) {
    deliverys = responsables[0];
  }

  if (pedidoActual.pedidos.length > 0) {
    mensaje =
      `El pedido se cerró!\n` +
      `Pedidos:\n` +
      pedidoActual.pedidos
        .sort((a, b) => (a.pedido.toLowerCase() > b.pedido.toLowerCase() ? 1 : -1))
        .map(pedido => `${pedido.de} - ${pedido.pedido}\n`)
        .join("") +
      `El responsable de llamar es:\n - ${responsables[0]}\n` +
      `El teléfono es 4791-2900\n` +
      `Los responsables de ir a buscar el pedido son: \n - ${deliverys}\n`;
  }

  store.unlink("pedidoActual");

  return { resultado: true, mensaje };
}

function pedir(chatMessage, command) {
  const { id, username, first_name } = chatMessage.message.from;

  const persona = username || first_name;
  const pedido = command.substring("/pedir".length).trim();
  const pedidoActual = store.read("pedidoActual");

  if (!pedidoActual) {
    return { resultado: false, mensaje: "No existe un pedido abierto!" };
  }

  pedidosASalvar = pedidoActual.pedidos.filter(pedido => pedido.de !== persona);

  store.save("pedidoActual", {
    ...pedidoActual,
    pedidos: [...pedidosASalvar, { de: persona, pedido }]
  });

  // A ver si leila puede ventrilocuar
  if (Math.random() > 0.5) {
    return { resultado: true, mensaje: "Registrado..." };
  } else {
    return { resultado: true, mensaje: "Registrado!" };
  }
}

function telefono(chatMessage, command) {
  return { result: true, mensaje: "El teléfono es 4791-2900\n" };
}

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function getRandomProperty(obj) {
  var keys = Object.keys(obj);
  return obj[keys[(keys.length * Math.random()) << 0]];
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = router;
