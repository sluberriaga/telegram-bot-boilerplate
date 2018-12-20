const fs = require("fs");

function save(key, value) {
  return fs.writeFileSync(
    `${__dirname}/${key}.json`,
    JSON.stringify(value, null, 4)
  );
}

function read(key) {
  if (check(key)) {
    return JSON.parse(fs.readFileSync(`${__dirname}/${key}.json`));
  }

  return null;
}

function unlink(key) {
  let pedidos = read("historico");
  if (!pedidos) {
    save("historico", []);
    pedidos = [];
  }

  const pedidoActual = read("pedidoActual");
  if (pedidoActual) {
    pedidos.push(pedidoActual);
    save("historico", pedidos);
  }

  return fs.unlinkSync(`${__dirname}/${key}.json`);
}

function check(filename) {
  try {
    fs.statSync(`${__dirname}/${filename}.json`).size > 0;
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = {
  save,
  read,
  unlink
};
