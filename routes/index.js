var express = require("express");
var store = require("./store");
var client = require("./../client");
var menu = require("./menu");

var router = express.Router();

router.get("/", (req, res) => {
  res.json({ ok: true });
});

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
              if (chatMessage.message.text.startsWith("/abrir")) {
                client.sendMessage(
                  chatMessage.message.chat.id,
                  abrir().mensaje
                );
              } else if (chatMessage.message.text.startsWith("/cerrar")) {
                client.sendMessage(
                  chatMessage.message.chat.id,
                  cerrar().mensaje
                );
              } else if (chatMessage.message.text.startsWith("/pedir")) {
                const { id, username, first_name } = chatMessage.message.from;
                const response = pedir(
                  username || first_name,
                  chatMessage.message.text.substring("/pedir".length).trim()
                );
                client.sendMessage(
                  chatMessage.message.chat.id,
                  applyEasterEgg(id, first_name, username, response.mensaje),
                  { parse_mode: "Markdown" }
                );
              } else if (chatMessage.message.text.startsWith("/pedido")) {
                client.sendMessage(
                  chatMessage.message.chat.id,
                  pedido().mensaje
                );
              } else if (chatMessage.message.text.startsWith("/sugerencia")) {
                client.sendMessage(
                  chatMessage.message.chat.id,
                  sugerencia().mensaje
                );
              } else if (chatMessage.message.text.startsWith("/menu")) {
                client.sendMessage(
                  chatMessage.message.chat.id,
                  mostrarMenu().mensaje
                );
              } else if (chatMessage.message.text.startsWith("/qr")) {
                client.sendPhoto(
                  chatMessage.message.chat.id,
                  "AgADAQADbqgxG--wKERNgktIZMI8NP-3CjAABIToFvdIT3dNfVMCAAEC"
                );
              } else if (chatMessage.message.text.startsWith("/telefono")) {
                client.sendMessage(
                  chatMessage.message.chat.id,
                  telefono().mensaje
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
      }
    );
}

function applyEasterEgg(id, first_name, username, original) {
  if (id === 35556320) {
    return `Pidiendo...
	\`\`\`                                      .
                             /^\\     .
                        /\\   "V"
                       /__\\   I      O  o
                      //..\\\\  I     .
                      \\].\`[/  I
                      /l\\/j\\  (]    .  O
                     /. ~~ ,\\/I          .
                     \\\\L__j^\\/I       o
                      \\/--v}  I     o   .
                      |    |  I   _________
                      |    |  I c(\`       ')o
                      |    l  I   \\.     ,/     
                    _/j  L l\\_!  _//^---^\\\\_
				 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	\`\`\`
			...the Magic is in the air!`;
  }

  if (username === "pupukaru") {
    return original;
  }

  if (username === "slucero") {
    return "10:4 Roger 👮‍♀! ";
  }

  if (username === "ignaciorojas") {
    return "Permiso denegado. Los actores no comen eso.";
  }

  if (first_name === "Yamil") {
    return "\ud83d\udc08 Meowww!";
  }

  if (first_name === "A4") {
    return "\ud83d\udcaa Listo!";
  }

  return original;
}

function mostrarMenu() {
  const mensaje = Object.keys(menu)
    .map(formatCategoria)
    .join("");

  function formatCategoria(categoria) {
    return `${capitalize(categoria)}\n  - Platos\n${menu[categoria].platos
      .map(plato => `    - ${plato}\n`)
      .join("")}${
      categoria === "pastas"
        ? `  - Salsas\n${menu[categoria].salsas
            .map(salsa => `    - ${salsa}\n`)
            .join("")}`
        : ""
    }`;
  }

  return { result: true, mensaje };
}

function sugerencia() {
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

function telefono() {
  const mensaje = "47912900";
  return { result: true, mensaje };
}

function pedido() {
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

function abrir() {
  let pedidoActual = store.read("pedidoActual");

  if (pedidoActual) {
    return { resultado: false, mensaje: "Ya existe un pedido abierto!" };
  }

  store.save("pedidoActual", {
    created_at: Date.now(),
    pedidos: [],
    estado: "abierto"
  });

  return { resultado: true, mensaje: "Listo, ya podes realizar tu pedido!" };
}

function cerrar() {
  let pedidoActual = store.read("pedidoActual");
  let cant_responsables = 1;
  let mensaje = "Se cerro el pedido pero estaba vacío!";

  if (!pedidoActual) {
    return { resultado: false, mensaje: "No existe un pedido abierto!" };
  }

  store.save("pedidoActual", {
    ...pedidoActual,
    estado: "cerrado"
  });

  const responsables = shuffle(
    Array.from(pedidoActual.pedidos.map(pedido => pedido.de))
  );

  if (responsables.length >= 4) {
    cant_responsables = responsables.length / 4;
  }

  let deliverys = responsables
    .filter((r, i) => i > 0 && i <= cant_responsables)
    .join("\n - ");

  if (deliverys.length == 0) {
    deliverys = responsables[0];
  }

  if (pedidoActual.pedidos.length > 0) {
    mensaje =
      `El pedido se cerró!\n` +
      `Pedidos:\n` +
      pedidoActual.pedidos
        .sort((a, b) => (a.pedido > b.pedido ? 1 : -1))
        .map(pedido => `${pedido.de} - ${pedido.pedido}\n`)
        .join("") +
      `El responsable de llamar es:\n - ${responsables[0]}\n` +
      `Los responsables de ir a buscar el pedido son: \n - ${deliverys}\n`;
  }

  store.unlink("pedidoActual");

  return { resultado: true, mensaje };
}

function pedir(persona, pedido) {
  let pedidoActual = store.read("pedidoActual");

  if (!pedidoActual) {
    return { resultado: false, mensaje: "No existe un pedido abierto!" };
  }

  pedidosASalvar = pedidoActual.pedidos.filter(pedido => pedido.de !== persona);

  store.save("pedidoActual", {
    ...pedidoActual,
    pedidos: [...pedidosASalvar, { de: persona, pedido }]
  });

  return { resultado: true, mensaje: "Registrado!" };
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
