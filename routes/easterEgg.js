function apply(chatMessage, original) {
  const { id, username, first_name } = chatMessage.message.from;

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
    return "Si... podría pedir eso, pero tal vez no!";
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

module.exports = apply;
