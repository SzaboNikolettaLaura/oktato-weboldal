export default [
    {
      text: "Hogyan lehet egy HTML fájlba beilleszteni egy külső JavaScript fájlt?",
      options: [
        "<script href='script.js'></script>",  // Incorrect
        "<script src='script.js'></script>",   // Correct
        "<js include='script.js'></js>",       // Incorrect
      ],
      correctAnswer: "<script src='script.js'></script>",  // Correct answer
    },
    {
      text: "Melyik változótípus nem létezik JavaScriptben?",
      options: [
        "var",       // Incorrect
        "let",       // Incorrect
        "constant",  // Correct
      ],
      correctAnswer: "constant",  // Correct answer
    },
    {
      text: "Mi az alapértelmezett érték egy nem inicializált változó számára JavaScriptben?",
      options: [
        "null",        // Incorrect
        "undefined",   // Correct
        "NaN",         // Incorrect
      ],
      correctAnswer: "undefined",  // Correct answer
    },
    {
      text: "Melyik adat típus nem létezik JavaScriptben?",
      options: [
        "Array",       // Incorrect
        "Set",         // Incorrect
        "List",        // Correct
      ],
      correctAnswer: "List",  // Correct answer
    },
    {
      text: "Mi történik, ha egy JavaScriptben a függvényben egy változót nem deklarálunk?",
      options: [
        "A változó automatikusan létrejön globálisan", // Correct
        "A függvény hibát dob",                        // Incorrect
        "A változó a függvényen kívül is elérhető lesz", // Incorrect
      ],
      correctAnswer: "A változó automatikusan létrejön globálisan",  // Correct answer
    },
    {
      text: "Melyik operátor a legmegfelelőbb egy feltételes érték ellenőrzésére?",
      options: [
        "==",          // Incorrect
        "===" ,        // Correct
        "!==",         // Incorrect
      ],
      correctAnswer: "===",  // Correct answer
    },
    {
      text: "Mi a JavaScript `map()` függvényének alapvető funkciója?",
      options: [
        "Létrehoz egy új tömböt, és minden elemre alkalmazza a függvényt", // Correct
        "Módosítja a meglévő tömböt helyben",                              // Incorrect
        "Megszűri a tömböt",                                               // Incorrect
      ],
      correctAnswer: "Létrehoz egy új tömböt, és minden elemre alkalmazza a függvényt",  // Correct answer
    },
    {
      text: "Mi a különbség a `null` és `undefined` között JavaScriptben?",
      options: [
        "`null` egy üres érték, míg `undefined` egy változó, amelyet nem inicializáltak", // Correct
        "`null` és `undefined` ugyanaz",                                             // Incorrect
        "`null` egy szám típusú, míg `undefined` egy string típusú",                // Incorrect
      ],
      correctAnswer: "`null` egy üres érték, míg `undefined` egy változó, amelyet nem inicializáltak",  // Correct answer
    },
    {
      text: "Melyik JavaScript módszert használjuk, hogy egy tömb elemeit megfordítsuk?",
      options: [
        "reverse()",  // Correct
        "flip()",     // Incorrect
        "invert()",   // Incorrect
      ],
      correctAnswer: "reverse()",  // Correct answer
    },
  ];
  